import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Slide from '@mui/material/Slide';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomSnackBar(props) {
  function TransitionUp(props) {
    return <Slide {...props} direction="up" />;
  }
  return (
    <Snackbar
      open={props.open}
      autoHideDuration={6000}
      onClose={props.handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      message={props.message}
    >
      <Alert
        onClose={props.handleClose}
        severity={props.messageType ? props.messageType: "info"}
        sx={{ width: "100%" }}
      >
        {props.message}
      </Alert>
    </Snackbar>
  );
}
//   {/* <Alert severity="error">This is an error message!</Alert>
//   <Alert severity="warning">This is a warning message!</Alert>
//   <Alert severity="info">This is an information message!</Alert>
//   <Alert severity="success">This is a success message!</Alert> */}
