import { useState, useCallback } from 'react'

const API_URL = 'https://open.er-api.com/v6/latest/BRL'

export function useCurrency(totalGeneral) {
  const [targetCurrency, setTargetCurrency] = useState('USD')
  const [convertedValue, setConvertedValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  const convert = useCallback(async () => {
    if (totalGeneral <= 0) return

    setLoading(true)
    setApiError(null)
    setConvertedValue(null)

    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()
      if (data.result !== 'success') {
        throw new Error(data['error-type'] || 'Resposta inválida da API')
      }

      const rate = data.rates[targetCurrency]
      if (!rate) {
        throw new Error(`Taxa para ${targetCurrency} não encontrada`)
      }

      setConvertedValue(totalGeneral * rate)
      setLastFetched(new Date().toLocaleTimeString('pt-BR'))
    } catch (error) {
      console.error('[currency]', error)
      setApiError(error.message || 'Falha ao buscar cotação.')
    } finally {
      setLoading(false)
    }
  }, [totalGeneral, targetCurrency])

  const resetConversion = useCallback(() => {
    setConvertedValue(null)
    setApiError(null)
  }, [])

  return {
    targetCurrency,
    setTargetCurrency,
    convertedValue,
    loading,
    apiError,
    lastFetched,
    convert,
    resetConversion,
  }
}
