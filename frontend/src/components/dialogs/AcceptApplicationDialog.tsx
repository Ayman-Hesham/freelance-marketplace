import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { PulseLoader } from 'react-spinners'

interface AcceptApplicationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  freelancerName?: string
  isLoading?: boolean
}

export function AcceptApplicationDialog({ isOpen, onClose, onConfirm, freelancerName, isLoading }: AcceptApplicationDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full max-w-lg">
          <Dialog.Title className="text-xl font-semibold">
            Accept Application
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-gray-600">
            Are you sure you want to accept this application?
          </Dialog.Description>

          <Dialog.Description className="mt-3 text-gray-600">
            This action will reject all other applicants and establish a direct message channel between you and {freelancerName} to further discuss the job.
          </Dialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <PulseLoader color="#fff" size={8} />
              ) : (
                'Accept'
              )}
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}