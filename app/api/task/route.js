import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySession } from '@/lib/verifySession';
import { DEFAULT_TASKS } from '@/lib/constants';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  const limited = enforceRateLimit(request, { name: 'task:claim', limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { userId, taskId } = await request.json();

  const valid = await verifySession(request, Number(userId));
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // reward client'tan değil, backend'den alınıyor
  const taskDef = DEFAULT_TASKS.find(t => t.id === taskId);
  if (!taskDef) return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
  const reward = Number(taskDef.reward);

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', Number(userId))
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((user.completed_task_ids || []).includes(taskId)) {
    return NextResponse.json(
      { error: 'Task already completed', completedTaskIds: user.completed_task_ids },
      { status: 400 }
    );
  }

  const { data: updatedUser } = await supabaseAdmin
    .from('users')
    .update({
      balance: (user.balance || 0) + reward,
      tasks_completed: (user.tasks_completed || 0) + 1,
      completed_task_ids: [...(user.completed_task_ids || []), taskId],
    })
    .eq('user_id', Number(userId))
    .select()
    .single();

  if (user.referred_by) {
    const { data: affiliate } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('code', user.referred_by)
      .single();

    if (affiliate) {
      const commission = Math.floor(reward * 0.1);
      const referrals = affiliate.referrals || [];
      const refIndex = referrals.findIndex(r => r.userId === Number(userId));

      if (refIndex >= 0) {
        referrals[refIndex].totalEarned = (referrals[refIndex].totalEarned || 0) + reward;
        referrals[refIndex].cut = (referrals[refIndex].cut || 0) + commission;
      } else {
        referrals.push({
          userId: Number(userId),
          username: user.username,
          totalEarned: reward,
          cut: commission,
          joinedAt: new Date().toISOString(),
        });
      }

      await supabaseAdmin
        .from('affiliates')
        .update({
          earnings: (affiliate.earnings || 0) + commission,
          referrals,
        })
        .eq('code', user.referred_by);
    }
  }

  return NextResponse.json({
    balance: updatedUser.balance,
    tasksCompleted: updatedUser.tasks_completed,
    completedTaskIds: updatedUser.completed_task_ids,
  });
}
