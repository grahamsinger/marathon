import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFeedback } from '../../hooks/useFeedback';

export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const location = useLocation();
  const { createFeedback, isSubmitting } = useFeedback();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    await createFeedback({ message: message.trim(), page: location.pathname });
    setMessage('');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
      >
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Send Feedback</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            {submitted ? (
              <p className="text-green-600 font-medium py-4 text-center">Thanks for the feedback!</p>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Bug, feature request, or anything that looks off..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
