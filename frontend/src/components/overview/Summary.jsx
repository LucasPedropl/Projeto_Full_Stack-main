import React from 'react'
import { useExpenses } from '../../contexts/ExpenseContext.jsx'
import { useCurrency } from '../../hooks/useCurrency.js'
import { CURRENCIES, getCategoryMeta } from '../../constants.js'
import SearchableSelect from '../ui/SearchableSelect.jsx'
import styles from './Summary.module.css'

const formatBRL = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatForeign = (value, symbol) =>
  `${symbol} ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`

const CURRENCY_OPTIONS = CURRENCIES.map((currency) => ({
  value: currency.code,
  label: currency.label,
}))

export default function Summary() {
  const { totalGeneral, totalByCategory } = useExpenses()
  const {
    targetCurrency,
    setTargetCurrency,
    convertedValue,
    loading,
    apiError,
    lastFetched,
    convert,
    resetConversion,
  } = useCurrency(totalGeneral)

  const currencyMeta = CURRENCIES.find((item) => item.code === targetCurrency)
  const categoryEntries = Object.entries(totalByCategory).sort((a, b) => b[1] - a[1])

  const handleCurrencyChange = (code) => {
    setTargetCurrency(code)
    resetConversion()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.totalCard}>
        <span className={styles.totalLabel}>Total filtrado</span>
        <span className={styles.totalValue}>{formatBRL(totalGeneral)}</span>
      </div>

      {categoryEntries.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Por Categoria</h3>
          <div className={styles.categoryList}>
            {categoryEntries.map(([category, value]) => {
              const meta = getCategoryMeta(category)
              const percentage = totalGeneral > 0 ? (value / totalGeneral) * 100 : 0

              return (
                <div key={category} className={styles.catRow}>
                  <div className={styles.catLeft}>
                    <span className={styles.catEmoji}>{meta.emoji}</span>
                    <span className={styles.catName}>{meta.label}</span>
                  </div>
                  <div className={styles.catRight}>
                    <span className={styles.catValue}>{formatBRL(value)}</span>
                    <span className={styles.catPct}>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${percentage}%`, background: meta.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Converter Moeda</h3>

        <div className={styles.converterRow}>
          <div className={styles.selectWrap}>
            <SearchableSelect
              value={targetCurrency}
              onChange={handleCurrencyChange}
              options={CURRENCY_OPTIONS}
              placeholder="Moeda"
              searchPlaceholder="Pesquisar moeda..."
            />
          </div>

          <button
            type="button"
            className={styles.convertBtn}
            onClick={convert}
            disabled={loading || totalGeneral <= 0}
          >
            {loading ? <span className={styles.spinner} /> : 'Converter'}
          </button>
        </div>

        {loading && (
          <div className={styles.loadingMsg}>
            <span className={styles.spinner} /> Buscando cotação...
          </div>
        )}

        {apiError && (
          <div className={styles.errorMsg}>
            <strong>Erro na API:</strong> {apiError}
          </div>
        )}

        {convertedValue !== null && !loading && (
          <div className={styles.result}>
            <div className={styles.resultLabel}>{formatBRL(totalGeneral)} =</div>
            <div className={styles.resultValue}>
              {formatForeign(convertedValue, currencyMeta?.symbol || '')}
              <span className={styles.resultCode}>{targetCurrency}</span>
            </div>
            {lastFetched && (
              <div className={styles.resultFooter}>
                Cotação às {lastFetched} · open.er-api.com
              </div>
            )}
          </div>
        )}

        {totalGeneral <= 0 && (
          <p className={styles.hint}>Adicione gastos para converter.</p>
        )}
      </div>
    </div>
  )
}
