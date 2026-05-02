import styles from "./SectionDivider.module.scss";

type Props = {
  label: string;
  variant?: "rule" | "banner";
};

export function SectionDivider({ label, variant = "rule" }: Props) {
  if (variant === "banner") {
    return (
      <div className={styles.banner} role="separator">
        <span className={styles.bannerLabel}>{label}</span>
      </div>
    );
  }

  return (
    <div className={styles.divider} role="separator">
      <span className={styles.label}>{label}</span>
    </div>
  );
}
