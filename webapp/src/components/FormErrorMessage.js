import { useTheme } from "@mui/material";

function FormErrorMessage(props) {
  const theme = useTheme();
  return (
    <div style={{
      width: '100%',
      display: 'block',
      color: theme.palette.error.main,
    }}>
      {props.errorMessage}
    </div>
  );
}

export default FormErrorMessage;