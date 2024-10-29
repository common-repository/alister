import React from "react";
import { Grid, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { styled } from "@mui/material/styles";

import "../../../styles/Importer/ProductEditor/OptionEditor.css";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export const OptionEditor = (props) => {
  const {
    properties,
    onPropertyUpdate,
    onChangeApplyTransformations,
    productId,
  } = props;

  const handleOptionNameChange = (value, id, key) => {
    properties[key].name = value;
    onPropertyUpdate(productId, properties[key].id, properties[key]);
  };

  const handleValueChange = (value, valueKey, key) => {
    properties[key].values[valueKey].name = value;
    onPropertyUpdate(productId, properties[key].id, properties[key]);
  };

  const handleActiveChange = (value, valueKey, key) => {
    properties[key].values[valueKey].active = value;
    onPropertyUpdate(productId, properties[key].id, properties[key]);
  };

  return (
    <div className="option-editor-container">
      {Object.keys(properties).map((key) => {
        return (
          <BasicMenu
            propertyName={properties[key].name}
            propertyKey={key}
            properties={properties}
            handleOptionNameChange={handleOptionNameChange}
            handleValueChange={handleValueChange}
            handleActiveChange={handleActiveChange}
            onChangeApplyTransformations={onChangeApplyTransformations}
            productId={productId}
          ></BasicMenu>
        );
      })}
    </div>
  );
};

const BasicMenu = (props) => {
  const { propertyName, properties, propertyKey, productId } = props;

  const handleOptionNameChange = props.handleOptionNameChange;
  const handleValueChange = props.handleValueChange;
  const handleActiveChange = props.handleActiveChange;
  const onChangeApplyTransformations = props.onChangeApplyTransformations;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flex: "1",
        maxWidth: "25%",
        minWidth: "25%",
        marginRight: 10,
      }}
    >
      <Button
        variant="outlined"
        endIcon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        style={{ width: "90%", color: "black", borderColor: "black" }}
      >
        {propertyName}
      </Button>
      <Tooltip title="Check to apply transformations">
      <Checkbox
        checked={properties[propertyKey].applyTransformations}
        onChange={(event) =>
          onChangeApplyTransformations(
            productId,
            propertyKey,
            event.target.checked
          )
        }
        style={{ marginLeft: "auto" }}
      />
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Box style={{ padding: 20, width: "500px", maxHeight: "500px" }}>
          <Stack spacing={2} elevation={0}>
            <Item style={{ boxShadow: "none", width: "100%" }}>
              <input
                type="text"
                onKeyDown={(e) => e.stopPropagation()}
                className="custom-input"
                style={{ width: "100%", marginBottom: 10 }}
                value={properties[propertyKey].name}
                onChange={(e) =>
                  handleOptionNameChange(
                    e.target.value,
                    properties[propertyKey].id,
                    propertyKey
                  )
                }
              ></input>
            </Item>
          </Stack>
          <Grid id="top-grid" container spacing={2}>
            {Object.keys(properties[propertyKey].values).map((valueKey) => (
              <Grid
                item
                xs={6}
                style={{ display: "flex", alignItems: "center" }}
                key={valueKey.toString()}
              >
                <img
                  src={properties[propertyKey].values[valueKey].varImage}
                  width="80"
                  style={{ marginRight: 10 }}
                ></img>
                <span style={{ display: "block", position: "relative" }}>
                  <input
                    type="text"
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{
                      font: "inherit",
                      fontSize: "medium",
                      letterSpacing: "inherit",
                      background: "none",
                      margin: 0,
                      display: "block",
                      width: "100%",
                      padding: "8.5px 35px 8.5px 14px",
                      borderColor: "#ddd",
                    }}
                    value={properties[propertyKey].values[valueKey].name}
                    onChange={(e) =>
                      handleValueChange(e.target.value, valueKey, propertyKey)
                    }
                  ></input>
                  <Checkbox
                    className="image-checkbox"
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      top: "20%",
                      right: "5%",
                      padding: 0,
                    }}
                    checked={properties[propertyKey].values[valueKey].active}
                    onChange={(e) =>
                      handleActiveChange(
                        e.target.checked,
                        valueKey,
                        propertyKey
                      )
                    }
                  ></Checkbox>
                </span>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Menu>
    </div>
  );
};
