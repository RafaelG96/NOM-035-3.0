import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const FormLockContext = createContext({
  isLocked: false,
  lockMessage: '',
  lockForm: () => {},
  unlockForm: () => {}
})

export function FormLockProvider({ children }) {
  const [isLocked, setIsLocked] = useState(false)
  const [lockMessage, setLockMessage] = useState('')

  const lockForm = useCallback((message) => {
    setIsLocked(true)
    setLockMessage(
      message ||
        'Por favor completa y envía el formulario antes de abandonar la página.'
    )
  }, [])

  const unlockForm = useCallback(() => {
    setIsLocked(false)
    setLockMessage('')
  }, [])

  const value = useMemo(
    () => ({
      isLocked,
      lockMessage,
      lockForm,
      unlockForm
    }),
    [isLocked, lockMessage, lockForm, unlockForm]
  )

  return (
    <FormLockContext.Provider value={value}>
      {children}
    </FormLockContext.Provider>
  )
}

export function useFormLock() {
  return useContext(FormLockContext)
}


