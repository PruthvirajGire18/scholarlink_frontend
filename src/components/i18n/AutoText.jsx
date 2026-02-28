import useAutoTranslateText from "../../hooks/useAutoTranslateText";

export default function AutoText({ text, as = "span", className = "" }) {
  const translated = useAutoTranslateText(text);
  const Component = as;

  return <Component className={className}>{translated}</Component>;
}
