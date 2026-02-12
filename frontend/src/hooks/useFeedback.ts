import { useMutation } from '@tanstack/react-query';
import { createFeedback } from '../api';

export function useFeedback() {
  const create = useMutation({
    mutationFn: (data: { message: string; page?: string | null }) =>
      createFeedback(data),
  });

  return {
    createFeedback: create.mutateAsync,
    isSubmitting: create.isPending,
  };
}
