"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QRScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Basic scanner config
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }

    const scanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false)
    scannerRef.current = scanner

    scanner.render(
      (decodedText) => {
        onScan(decodedText)
        scanner.clear()
        onClose()
      },
      (errorMessage) => {
        // We don't want to show every scanning error (like "QR code not found in frame")
        // but we can log them if needed
      }
    )

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear scanner:", error)
        })
      }
    }
  }, [onScan, onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Scanner un produit</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <div id="reader" className="w-full"></div>
          {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        </div>
        
        <div className="p-4 bg-gray-50 flex justify-center">
          <p className="text-sm text-gray-500 text-center">
            Placez le code QR au centre du cadre pour le scanner automatiquement
          </p>
        </div>
      </div>
    </div>
  )
}
