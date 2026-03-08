/**
 * State mapping utility to convert internal backend states to user-facing two-state system
 * 
 * Backend states (internal): submitted, in_progress, resolved, rejected
 * User-facing states: in_progress, resolved
 * 
 * Mapping:
 * - submitted → in_progress (user sees as "In Progress")
 * - in_progress → in_progress (user sees as "In Progress")
 * - resolved → resolved (user sees as "Resolved")
 * - rejected → in_progress (user sees as "In Progress", but admin can see it's rejected)
 */

export type UserFacingStatus = 'in_progress' | 'resolved';
export type BackendStatus = 'submitted' | 'in_progress' | 'resolved' | 'rejected';

/**
 * Convert backend status to user-facing status
 */
export function mapBackendStatusToUserFacing(status: BackendStatus): UserFacingStatus {
  if (status === 'resolved') {
    return 'resolved';
  }
  // submitted, in_progress, and rejected all appear as "in_progress" to users
  return 'in_progress';
}

/**
 * Get display label for user-facing status
 */
export function getStatusLabel(status: UserFacingStatus): string {
  return status === 'resolved' ? 'Resolved' : 'In Progress';
}

/**
 * Get color configuration for user-facing status
 */
export function getStatusColor(status: UserFacingStatus) {
  if (status === 'resolved') {
    return {
      label: 'Resolved',
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-300',
      pin: '#10B981',
      darkColor: 'dark:text-green-400',
      darkBg: 'dark:bg-green-950/30',
      darkBorder: 'dark:border-green-800',
    };
  }
  return {
    label: 'In Progress',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    pin: '#F59E0B',
    darkColor: 'dark:text-amber-400',
    darkBg: 'dark:bg-amber-950/30',
    darkBorder: 'dark:border-amber-800',
  };
}

/**
 * Filter problems to show only active (in-progress) ones to regular users
 */
export function filterActiveProblems(problems: any[]): any[] {
  return problems.filter(p => p.problem.status !== 'resolved');
}

/**
 * Filter problems to show only resolved ones
 */
export function filterResolvedProblems(problems: any[]): any[] {
  return problems.filter(p => p.problem.status === 'resolved');
}
