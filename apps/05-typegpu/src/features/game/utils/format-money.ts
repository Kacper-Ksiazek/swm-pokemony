/** "12 500 zł" / "−4 000 zł", with a non-breaking space between thousands (Polish style). */
export function formatMoney(amount: number) {
  const digits = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${amount < 0 ? "−" : ""}${digits} zł`;
}

/** Signed variant for changes: "+12 500 zł" / "−4 000 zł". */
export function formatMoneyChange(amount: number) {
  return amount >= 0 ? `+${formatMoney(amount)}` : formatMoney(amount);
}
