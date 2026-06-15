/**
 * nav-badges.js
 * Fetches live sidebar badge counts (jobs, proposals, messages) from the
 * backend and updates every nav badge element on the current page.
 *
 * Requires api.js to be loaded first (Auth, Jobs, Proposals, Messages).
 */
(async function loadNavBadges() {
  // Only run for authenticated users — silently skip if no session.
  let user;
  try {
    const { user: me } = await Auth.me();
    user = me;
  } catch {
    return; // Not logged in — badges stay hidden
  }

  function setBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
      el.textContent = count > 99 ? '99+' : String(count);
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  // Run all three fetches in parallel
  const [jobsResult, proposalsResult, messagesResult] = await Promise.allSettled([
    Jobs.list({ clientId: user.id }),
    user.role === 'CLIENT'
      ? Proposals.forJob ? null : null // CLIENT: proposals are per-job, count below
      : Proposals.myList(),
    Messages.getConversationsList(),
  ]);

  // ── My Jobs badge (CLIENT: count of their open/active jobs)
  if (jobsResult.status === 'fulfilled' && jobsResult.value?.data) {
    const activeCount = jobsResult.value.data.filter(
      j => j.status === 'OPEN' || j.status === 'IN_PROGRESS'
    ).length;
    setBadge('nav-jobs-badge', activeCount);
  }

  // ── Proposals badge
  if (user.role === 'CLIENT') {
    // For clients, sum up all pending proposals across their jobs
    if (jobsResult.status === 'fulfilled' && jobsResult.value?.data) {
      let pendingProposals = 0;
      const fetchPromises = jobsResult.value.data
        .filter(j => j.status === 'OPEN' || j.status === 'IN_PROGRESS')
        .map(job =>
          Proposals.forJob(job.id)
            .then(r => {
              const pending = (r.data || []).filter(p => p.status === 'PENDING').length;
              pendingProposals += pending;
            })
            .catch(() => {})
        );
      await Promise.all(fetchPromises);
      setBadge('nav-proposals-badge', pendingProposals);
    }
  } else {
    // For freelancers, show count of their submitted proposals
    if (proposalsResult.status === 'fulfilled' && proposalsResult.value?.data) {
      setBadge('nav-proposals-badge', proposalsResult.value.data.length);
    }
  }

  // ── Messages badge (total conversation threads)
  if (messagesResult.status === 'fulfilled' && messagesResult.value?.data) {
    setBadge('nav-messages-badge', messagesResult.value.data.length);
  }
})();
