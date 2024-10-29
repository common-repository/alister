import { Tooltip } from "@mui/material";

export const LoadingBar = (props) => {
  return (
    <Tooltip title={`${props.loadingWidth}%`}>
      <div id="myProgress" style={props.styles}>
        <div id="myBar" style={{ width: `${props.loadingWidth}%` }}></div>
      </div>
    </Tooltip>
  );
};
