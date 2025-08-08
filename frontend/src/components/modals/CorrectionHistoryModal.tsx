import { useState } from "react"
import { Dialog } from "@radix-ui/react-dialog"
import { X } from "lucide-react"

interface CorrectionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  deliverables: string[]
  correctionMessages: string[]
}

export function CorrectionHistoryModal({
  isOpen,
  onClose,
  deliverables,
  correctionMessages,
}: CorrectionHistoryModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const historyLength = Math.min(deliverables.length, correctionMessages.length)

  return (
    <Dialog open={isOpen} onOpenChange={open => !open ? onClose() : undefined}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Correction History</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <ul className="space-y-2">
              {Array.from({ length: historyLength }).map((_, i) => (
                <li key={i} className="border rounded-md">
                  <button
                    className="w-full flex justify-between items-center px-4 py-2 text-left hover:bg-gray-50"
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  >
                    <span className="font-medium block w-full text-center">Correction {i + 1}</span>
                    <span className="text-xs text-gray-400">{expandedIndex === i ? "▲" : "▼"}</span>
                  </button>
                  {expandedIndex === i && (
                    <div className="px-4 pb-4">
                      <div className="mb-2">
                        <span className="font-semibold">Message:</span>
                        <div className="whitespace-pre-wrap break-words bg-gray-100 rounded p-2 mt-1 text-sm">
                          {correctionMessages[i]}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold">Deliverable:</span>
                        <div className="mt-1">
                          <a
                            href={deliverables[i]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {decodeURIComponent(
                              deliverables[i].split("__").pop()?.split("?")[0] || ""
                            )}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default CorrectionHistoryModal