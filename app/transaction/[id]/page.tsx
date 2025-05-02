"use client"

import TransactionDetail from "@/components/TransactionDetail"

export default function TransactionPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <TransactionDetail transactionId={params.id} />
      </div>
    </main>
  )
}