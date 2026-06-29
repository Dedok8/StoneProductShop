const styles = {
  overlay: "fixed inset-0 flex items-center justify-center bg-background",
  spinner:
    "h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary",
  text: "text-sm text-muted-foreground animate-pulse",
};

export const PageLoader = () => (
  <div className={styles.overlay}>
    <div className={styles.spinner} />
    <p className={styles.text}>Loading...</p>
  </div>
);
