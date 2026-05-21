import { Building2 } from 'lucide-react'

const LoadingPage = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-rt-primary border border-rt-dark flex items-center justify-center shadow-xl animate-pulse">
        <Building2 size={24} className="text-white" />
      </div>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-rt-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-rt-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-rt-primary animate-bounce" />
      </div>
    </div>
  </div>
)

export default LoadingPage
