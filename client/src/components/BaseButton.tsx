import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type BaseButtonProps = Readonly<ButtonHTMLAttributes<HTMLButtonElement>>

export function BaseButton({ className, type = 'button', ...props }: Readonly<BaseButtonProps>) {
  return (
    <button
      type={type}
      className={cn(
        'cursor-pointer rounded-md bg-emerald-700 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
