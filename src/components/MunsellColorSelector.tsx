import {
  HueNames,
  MunsellColor,
  isOutOfGamut,
  munsellColorToMunsellHvc,
} from "@/lib/color";
import { useState } from "react";
import styles from "./MunsellColorSelector.module.css";

type HorizontalTableProps<T> = {
  options: T[];
  value: T;
  onChange: (selected: T) => void;
};

const HorizontalTable = <T,>({
  options,
  value,
  onChange,
}: HorizontalTableProps<T>) => {
  const [selected, setSelected] = useState(value);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const select = (option: T) => {
    setSelected(option);
    onChange(option);
  };
  return (
    <table
      className={styles["horizontal-table"]}
      onMouseLeave={() => setIsMouseDown(false)}
    >
      <tbody>
        <tr>
          {options.map((option) => (
            <td
              key={String(option)}
              className={option === selected ? styles["selected"] : ""}
              onMouseDown={() => setIsMouseDown(true)}
              onMouseUp={() => setIsMouseDown(false)}
              onMouseEnter={() => {
                if (isMouseDown) select(option);
              }}
              onClick={() => select(option)}
            >
              {String(option)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

type SliderProps = {
  min: number;
  max: number;
  value: number;
  step: number;
  onChange: (value: number) => void;
};

const Slider = (props: SliderProps) => {
  const [value, setValue] = useState(props.value);
  return (
    <div className={styles["slider-container"]}>
      <input
        className={styles["slider"]}
        type="range"
        min={props.min}
        max={props.max}
        value={value}
        step={props.step}
        onChange={(event) => {
          const newValue = Number(event.target.value);
          setValue(newValue);
          props.onChange(newValue);
        }}
      />
      <div>{value}</div>
    </div>
  );
};

export type MunsellColorSelectorProps = {
  initColor: MunsellColor;
  onChange: (Color: MunsellColor) => void;
};

export const MunsellColorSelector = ({
  initColor,
  onChange,
}: MunsellColorSelectorProps) => {
  const [color, setColor] = useState(initColor);

  const updateColor = (partialColor: Partial<MunsellColor>) => {
    const newColor = { ...color, ...partialColor };
    onChange(newColor);
    setColor(newColor);
  };

  return (
    <div className={styles["relative-container"]}>
      <dl className={styles["row"]}>
        <dt>Hue</dt>
        <dd>
          <HorizontalTable
            options={Array.from(HueNames)}
            value={color.hueName}
            onChange={(hueName) => updateColor({ hueName })}
          />
        </dd>
        <dt>Prefix</dt>
        <dd>
          <HorizontalTable
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            value={color.huePrefix}
            onChange={(huePrefix) => updateColor({ huePrefix })}
          />
        </dd>
      </dl>
      <dl className={styles["row"]}>
        <dt>Value</dt>
        <dd>
          <Slider
            min={0}
            max={10}
            value={color.value}
            step={0.1}
            onChange={(value) => updateColor({ value })}
          />
        </dd>
        <dt>Chroma</dt>
        <dd>
          <Slider
            min={0}
            max={30}
            value={color.chroma}
            step={0.5}
            onChange={(chroma) => updateColor({ chroma })}
          />
        </dd>
      </dl>
    </div>
  );
};

export default MunsellColorSelector;
