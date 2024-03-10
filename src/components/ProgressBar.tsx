import styles from "./ProgressBar.module.css";

export type ProgressBarProps = {
  value: number;
  maxVal: number;
};

export const ProgressBar = ({ value, maxVal }: ProgressBarProps) => {
  const width = (value / maxVal) * 100;
  return (
    <div className={styles["progress-bar"]}>
      <div
        className={styles["progress-bar_filler"]}
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
