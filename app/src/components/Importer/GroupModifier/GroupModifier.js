import React from "react";
import {
  Radio,
  RadioGroup,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Card,
  Popover,
  Button,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { CategorySelector } from "../../shared/CategorySelector";
import HelpDialog from "../../shared/HelpDialog";
import {
  AIGeneratorHelpContent,
  CategoryHelpContent,
  TagsHelpContent,
  DescriptionTemplatesHelpContent,
  PricingHelpContent,
  PropertiesHelpContent,
} from "../../../utlis";
import { PropertyDictionary } from "./PropertyDictionary";

import "../../../styles/Importer/GroupModifier/GroupModifier.css";
import { LoadingBar } from "../../shared/LoadingBar";
import { TagSelector } from "../../shared/TagSelector";

const AIDescriptionPopover = (props) => {
  const {
    width,
    onAIDescriptionApply,
    generationInProgress,
    aiDescriptionTemplates,
    isProductSelected,
    onRefreshDescriptionTemplates,
    openSnackBar,
  } = props;

  const defaultTemplate = {
    id: "defaultTemplateId",
    template: `
  Given the following input create a product description for an ecommerce store:
  Text length: 50 words
  creativity: high
  Data:
  {{ali_title}}
  {{ali_description}}
  {{ali_properties}}

  Other info:
  Make sure to mention quality
  `,
    name: "default",
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [descriptionPrompt, setDescriptionPrompt] = React.useState(
    defaultTemplate.template
  );
  const [templateId, setTemplateId] = React.useState(defaultTemplate.id);
  const [templateName, setTemplateName] = React.useState("");
  const [savingTemplate, setSavingTemplate] = React.useState(false);
  const [deletingTemplate, setDeletingTemplate] = React.useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSaveTemplate = async (name, template) => {
    setSavingTemplate(true);
    try {
      const data = {
        type: "POST",
        url: alisterData.url,
        data: {
          action: "alister_add_ai_description_template",
          name,
          template,
        },
      };
      const response = await jQuery.ajax(data);

      if (!response) {
        throw new Error(`Error! failed to save template ${name}`);
      }
      openSnackBar(`Template saved: ${name}`, "success");
    } catch (err) {
      openSnackBar(`Error: ${err.statusText}`, "error");
    } finally {
      setSavingTemplate(false);
    }
    onRefreshDescriptionTemplates();
  };

  const handleDeleteTemplate = async () => {
    const template = aiDescriptionTemplates.find((t) => t.id == templateId);
    if (!template?.delete_nonce) return;
    setDeletingTemplate(true);
    try {
      const data = {
        type: "POST",
        url: alisterData.url,
        data: {
          action: "delete-post",
          id: templateId,
          _ajax_nonce: template["delete_nonce"],
        },
      };
      const response = await jQuery.ajax(data);

      if (!response) {
        throw new Error(`Error! failed to remove template ${id}`);
      }
    } catch (err) {
      openSnackBar(err.message, "error");
    } finally {
      setDeletingTemplate(false);
    }
    setTemplateId("");
    onRefreshDescriptionTemplates();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div style={{ zIndex: 200, width }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        style={{ width: "100%" }}
        endIcon={anchorEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      >
        Description
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="popover-main-div">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 15,
            }}
          >
            <Select
              name={"Templates"}
              size="small"
              style={{ width: "60%" }}
              onChange={(event) => {
                setTemplateId(event.target.value);
                if (event.target.value == "defaultTemplateId") {
                  setDescriptionPrompt(defaultTemplate.template);
                } else {
                  const template = aiDescriptionTemplates.find(
                    (t) => t.id == event.target.value
                  );
                  if (template?.template)
                    setDescriptionPrompt(template?.template);
                }
              }}
              value={templateId}
            >
              <MenuItem value={defaultTemplate.id}>
                {defaultTemplate.name}
              </MenuItem>
              {aiDescriptionTemplates.map((opt) => {
                return (
                  <MenuItem value={opt.id}>
                    <Tooltip title={opt.template} placement="right-end">
                      <span>{opt.name}</span>
                    </Tooltip>
                  </MenuItem>
                );
              })}
            </Select>
            <LoadingButton
              loading={deletingTemplate}
              disabled={templateId == defaultTemplate.id}
              variant="outlined"
              color="primary_ultimus"
              style={{ width: "25%", maxHeight: 35 }}
              onClick={(event) => handleDeleteTemplate()}
            >
              Delete
            </LoadingButton>
          </div>
          <textarea
            rows="10"
            style={{ width: "100%", resize: "none" }}
            onChange={(e) => setDescriptionPrompt(e.target.value)}
            value={descriptionPrompt}
          ></textarea>
          <div
            style={{
              display: "flex",
              marginTop: 15,
              alignItems: "center",
              width: "100%",
            }}
          >
            <LoadingButton
              loading={generationInProgress}
              variant="contained"
              size="small"
              color="primary_ultimus"
              disabled={!isProductSelected}
              onClick={(event) =>
                onAIDescriptionApply(descriptionPrompt, "description")
              }
              style={{ width: "25%", maxHeight: 35 }}
            >
              Generate
            </LoadingButton>
            <input
              type="text"
              className="custom-input generic-background-color"
              placeholder="Set Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              style={{
                width: "35%",
                marginLeft: "auto",
                marginRight: "2%",
                maxHeight: 35,
              }}
            ></input>
            <LoadingButton
              loading={savingTemplate}
              disabled={!templateName.trim()}
              variant="outlined"
              color="primary_ultimus"
              style={{ width: "25%", maxHeight: 35 }}
              onClick={(event) =>
                handleSaveTemplate(templateName, descriptionPrompt)
              }
            >
              Save
            </LoadingButton>
          </div>
        </div>
      </Popover>
    </div>
  );
};

const AITitlePopover = (props) => {
  const {
    width,
    aiTitleTemplates,
    onGenerateAItitle,
    generationInProgress,
    isProductSelected,
    onRefreshDescriptionTemplates,
    openSnackBar,
  } = props;

  const defaultTemplate = {
    id: "defaultTemplateId",
    template: `
    Given the following input create a product title for an ecommerce store:
    Text length: 5 words
    creativity: high
    Data:
    {{ali_title}}
    {{ali_description}}
    {{ali_properties}}
  
    Other info:
    Make sure to mention quality
    `,
    name: "default",
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [titlePrompt, setTitlePrompt] = React.useState(
    defaultTemplate.template
  );
  const [templateId, setTemplateId] = React.useState(defaultTemplate.id);
  const [templateName, setTemplateName] = React.useState("");
  const [savingTemplate, setSavingTemplate] = React.useState(false);
  const [deletingTemplate, setDeletingTemplate] = React.useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSaveTemplate = async (name, template) => {
    setSavingTemplate(true);
    try {
      const data = {
        type: "POST",
        url: alisterData.url,
        data: {
          action: "alister_add_ai_title_template",
          name,
          template,
        },
      };
      const response = await jQuery.ajax(data);

      if (!response) {
        throw new Error(`Error! failed to save template ${name}`);
      }
      openSnackBar(`Template saved: ${name}`, "success");
    } catch (err) {
      openSnackBar(`Error: ${err.statusText}`, "error");
    } finally {
      setSavingTemplate(false);
    }
    onRefreshDescriptionTemplates();
  };

  const handleDeleteTemplate = async () => {
    const template = aiTitleTemplates.find((t) => t.id == templateId);
    if (!template?.delete_nonce) return;
    setDeletingTemplate(true);
    try {
      const data = {
        type: "POST",
        url: alisterData.url,
        data: {
          action: "delete-post",
          id: templateId,
          _ajax_nonce: template["delete_nonce"],
        },
      };
      const response = await jQuery.ajax(data);

      if (!response) {
        throw new Error(`Error! failed to remove template ${id}`);
      }
    } catch (err) {
      openSnackBar(err.message, "error");
    } finally {
      setDeletingTemplate(false);
    }
    setTemplateId("");
    onRefreshDescriptionTemplates();
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div style={{ zIndex: 200, width }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        style={{ width: "100%" }}
        onClick={handleClick}
        endIcon={anchorEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      >
        Title
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            flexDirection: "column",
            minWidth: 400,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 15,
            }}
          >
            <Select
              name={"Templates"}
              size="small"
              style={{ width: "60%" }}
              onChange={(event) => {
                setTemplateId(event.target.value);
                if (event.target.value == "defaultTemplateId") {
                  setTitlePrompt(defaultTemplate.template);
                } else {
                  const template = aiTitleTemplates.find(
                    (t) => t.id == event.target.value
                  );
                  if (template?.template) setTitlePrompt(template?.template);
                }
              }}
              value={templateId}
            >
              <MenuItem value={defaultTemplate.id}>
                {defaultTemplate.name}
              </MenuItem>
              {aiTitleTemplates.map((opt) => {
                return (
                  <MenuItem value={opt.id}>
                    <Tooltip title={opt.template} placement="right-end">
                      <span>{opt.name}</span>
                    </Tooltip>
                  </MenuItem>
                );
              })}
            </Select>
            <LoadingButton
              loading={deletingTemplate}
              disabled={templateId == defaultTemplate.id}
              variant="outlined"
              color="primary_ultimus"
              style={{ width: "25%", maxHeight: 35 }}
              onClick={(event) => handleDeleteTemplate()}
            >
              Delete
            </LoadingButton>
          </div>
          <textarea
            rows="10"
            style={{ width: "100%", resize: "none" }}
            onChange={(e) => setTitlePrompt(e.target.value)}
            value={titlePrompt}
          ></textarea>
          <div
            style={{
              display: "flex",
              marginTop: 15,
              alignItems: "center",
              width: "100%",
            }}
          >
            <LoadingButton
              loading={generationInProgress}
              variant="contained"
              size="small"
              color="primary_ultimus"
              onClick={(event) => onGenerateAItitle(titlePrompt, "title")}
              disabled={!isProductSelected}
            >
              GET TITLE
            </LoadingButton>
            <input
              type="text"
              className="custom-input generic-background-color"
              placeholder="Set Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              style={{
                width: "35%",
                marginLeft: "auto",
                marginRight: "2%",
                maxHeight: 35,
              }}
            ></input>
            <LoadingButton
              loading={savingTemplate}
              disabled={!templateName.trim()}
              variant="outlined"
              color="primary_ultimus"
              style={{ width: "25%", maxHeight: 35 }}
              onClick={(event) => handleSaveTemplate(templateName, titlePrompt)}
            >
              Save
            </LoadingButton>
          </div>
        </div>
      </Popover>
    </div>
  );
};

const DescriptionPopover = (props) => {
  const {
    width,
    descriptionTemplates,
    onDescriptionTemplateApply,
    onDescriptionTemplateDelete,
    isProductSelected,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div style={{ zIndex: 200, width }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        style={{ width: "100%" }}
        endIcon={anchorEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      >
        Template
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div
          className="popover-main-div"
          style={{
            minWidth: 400,
            maxHeight: "60vh",
          }}
        >
          {descriptionTemplates.map((t, index) => {
            const templateText = t.template;
            const templateName = t.name;
            const templateId = t.id;
            const templateNonce = t.delete_nonce;
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  flexBasis: "45%",
                  marginTop: 10,
                  marginRight: 10,
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  <h4>{templateName}</h4>
                  <Tooltip title="Add to description">
                    <Button
                      variant="outlined"
                      color="primary_ultimus"
                      onClick={(e) => {
                        onDescriptionTemplateApply(templateText);
                      }}
                      style={{
                        marginLeft: "auto",
                        maxHeight: 25,
                        marginRight: 10,
                      }}
                    >
                      Add
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete template">
                    <Button
                      variant="outlined"
                      color="primary_ultimus"
                      onClick={() =>
                        onDescriptionTemplateDelete(templateId, templateNonce)
                      }
                      style={{ maxHeight: 25 }}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </span>
                <span
                  dangerouslySetInnerHTML={{ __html: templateText }}
                  style={{
                    maxWidth: 400,
                    maxHeight: 200,
                    overflowY: "scroll",
                    fontSize: 11,
                  }}
                ></span>
              </div>
            );
          })}
        </div>
      </Popover>
    </div>
  );
};

const PricingPopover = (props) => {
  const {
    width,
    priceMultiplier,
    cents,
    onPricMultiplierChange,
    onCentsChange,
    onApplyPricing,
    isProductSelected,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div style={{ zIndex: 200, width }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        style={{ width: "100%" }}
        endIcon={anchorEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      >
        multiplier
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div
          className="popover-main-div"
          style={{
            minWidth: 250,
            padding: 30,
          }}
        >
          <span><b>multiplier</b></span>
          <input
            type="number"
            step={0.1}
            min="0.1"
            style={{ width: "98%", marginTop: 4 }}
            value={priceMultiplier}
            onChange={(event) => onPricMultiplierChange(event.target.value)}
          ></input>
          <span><b>cents</b></span>
          <input
            type="number"
            step={1}
            min="0"
            max="99"
            style={{ width: "98%", marginTop: 4 }}
            value={cents}
            onChange={(event) => onCentsChange(event.target.value)}
          ></input>

          <Button
            variant="contained"
            size="small"
            color="primary_ultimus"
            disabled={!priceMultiplier || !isProductSelected}
            onClick={(event) => onApplyPricing(priceMultiplier, cents)}
            style={{ width: "98%", marginTop: 20 }}
          >
            APPLY
          </Button>
        </div>
      </Popover>
    </div>
  );
};

const CategoryPopover = (props) => {
  const { width, onGroupSetCategories, isProductSelected } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [categories, setCategories] = React.useState([]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div style={{ zIndex: 200, width }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        style={{ width: "100%" }}
        endIcon={anchorEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      >
        Select
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="popover-main-div">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              marginBottom: 10,
              width: "100%",
            }}
          >
            <span style={{ width: "98%", marginBottom: 10 }}>
              <CategorySelector
                onCategoryChange={setCategories}
                categories={categories}
                isGroupSelector
              ></CategorySelector>
            </span>
            <Button
              variant="contained"
              size="small"
              color="primary_ultimus"
              onClick={(event) => onGroupSetCategories(categories)}
              style={{ width: "98%" }}
              disabled={!isProductSelected}
            >
              APPLY
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
};

const TagPopover = (props) => {
  const { width, onGroupSetTags, isProductSelected } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [tags, setTags] = React.useState([]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div style={{ zIndex: 200, width }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        style={{ width: "100%" }}
        endIcon={anchorEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      >
        Select
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="popover-main-div">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              marginBottom: 10,
              width: "100%",
            }}
          >
            <span style={{ width: "98%", marginBottom: 10 }}>
              <TagSelector
                onTagChange={setTags}
                tags={tags}
                isGroupSelector
              ></TagSelector>
            </span>
            <Button
              variant="contained"
              size="small"
              color="primary_ultimus"
              onClick={(event) => onGroupSetTags(tags)}
              style={{ width: "98%" }}
              disabled={!isProductSelected}
            >
              APPLY
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
};

const PropertiesPopover = (props) => {
  const {
    width,
    options,
    onRefreshOptions,
    openSnackBar,
    onTranslateProperties,
    onTransformPropertyValues,
    onResetProperties,
    onReplaceAll,
    isProductSelected,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [textToFind, setTextToFind] = React.useState("");
  const [replaceWith, setReplaceWith] = React.useState("");
  const [ignoreCase, setIgnoreCase] = React.useState(true);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div style={{ zIndex: 200, width }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        style={{ width: "100%" }}
        endIcon={anchorEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      >
        Transform
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="popover-main-div" style={{ maxWidth: 490 }}>
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Find text"
                style={{ width: "28%" }}
                value={textToFind}
                onChange={(event) => setTextToFind(event.target.value)}
              ></input>
              <ArrowForwardIcon></ArrowForwardIcon>
              <input
                type="text"
                placeholder="Replace with"
                style={{ width: "28%" }}
                value={replaceWith}
                onChange={(event) => setReplaceWith(event.target.value)}
              ></input>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ignoreCase}
                      onClick={() => setIgnoreCase(!ignoreCase)}
                    />
                  }
                  label="Ignore case"
                  style={{ fontSize: "58%" }}
                />
              </FormGroup>
              <Button
                variant="contained"
                size="small"
                color="primary_ultimus"
                onClick={() =>
                  onReplaceAll(textToFind, replaceWith, ignoreCase)
                }
                disabled={!isProductSelected}
              >
                REPLACE
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <span
                style={{
                  marginRight: 20,
                }}
              >
                <b>Transform:</b>
              </span>
              <Button
                variant="contained"
                size="small"
                color="primary_ultimus"
                className="property-transform-button"
                onClick={() => onTransformPropertyValues(true)}
                disabled={!isProductSelected}
              >
                Values to 1-9
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary_ultimus"
                className="property-transform-button"
                onClick={() => onTransformPropertyValues(false)}
                disabled={!isProductSelected}
              >
                Values to A-Z
              </Button>
              <Button
                color="primary_ultimus"
                variant="contained"
                className="property-transform-button"
                onClick={(e) => onResetProperties()}
                disabled={!isProductSelected}
              >
                Reset values
              </Button>
              <PropertyDictionary
                onTranslateProperties={onTranslateProperties}
                dictionary={options["property_dictionary"]}
                onRefreshOptions={onRefreshOptions}
                openSnackBar={openSnackBar}
                isProductSelected={isProductSelected}
              ></PropertyDictionary>
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export const GroupModifier = (props) => {
  const {
    onSelectAll,
    generationInProgress,
    importInProgress,
    AIProgressRate,
    descriptionTemplates,
    aiDescriptionTemplates,
    aiTitleTemplates,
    options,
    selectedLength,
    onRefreshDescriptionTemplates,
    onDescriptionTemplateApply,
    onImportSelected,
    onAIDescriptionTitleApply,
    onReplaceAll,
    onTransformPropertyValues,
    onTranslateProperties,
    onApplyPricing,
    onGroupSetCategories,
    onGroupSetTags,
    onResetProperties,
    onRefreshOptions,
    openSnackBar,
  } = props;

  const isProductSelected = selectedLength > 0;

  const [postStatus, setPostStatus] = React.useState("pending");
  const [priceMultiplier, setPriceMultiplier] = React.useState("1.2");

  const [cents, setCents] = React.useState("95")

  const handleDeleteDescriptionTemplate = async (id, delete_nonce) => {
    try {
      const data = {
        type: "POST",
        url: alisterData.url,
        data: {
          action: "delete-post",
          id: id,
          _ajax_nonce: delete_nonce,
        },
      };
      const response = await jQuery.ajax(data);

      if (!response) {
        throw new Error(`Error! failed to remove template ${id}`);
      }
    } catch (err) {
      openSnackBar(err.message, "error");
    }
    onRefreshDescriptionTemplates();
  };

  return (
    <div
      style={{
        position: "-webkit-sticky",
        position: "sticky",
        top: 40,
        zIndex: 100,
      }}
    >
      <Card>
        <div className="filter-container">
          <div className="filter-section" style={{ flex: "1 0 15%" }}>
            <div className="filter-label-div">
              <span>
                <b>AI Generator</b>
              </span>
              <HelpDialog
                title="AI Generator Settings"
                content={AIGeneratorHelpContent}
              ></HelpDialog>
              {AIProgressRate != "100" && (
                <div style={{ width: "30%", marginLeft: "auto" }}>
                  <LoadingBar loadingWidth={AIProgressRate} />
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <AIDescriptionPopover
                width="48%"
                aiDescriptionTemplates={aiDescriptionTemplates}
                onAIDescriptionApply={onAIDescriptionTitleApply}
                generationInProgress={generationInProgress}
                isProductSelected={isProductSelected}
                onRefreshDescriptionTemplates={onRefreshDescriptionTemplates}
                openSnackBar={openSnackBar}
              ></AIDescriptionPopover>
              <AITitlePopover
                width="48%"
                aiTitleTemplates={aiTitleTemplates}
                onGenerateAItitle={onAIDescriptionTitleApply}
                generationInProgress={generationInProgress}
                isProductSelected={isProductSelected}
                onRefreshDescriptionTemplates={onRefreshDescriptionTemplates}
                openSnackBar={openSnackBar}
              ></AITitlePopover>
            </div>
          </div>
          <div className="filter-section" style={{ flex: "1 0 15%" }}>
            <div className="filter-label-div">
              <span>
                <b>Description Templates</b>
              </span>
              <HelpDialog
                title="Description Templates"
                content={DescriptionTemplatesHelpContent}
              ></HelpDialog>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <DescriptionPopover
                width="100%"
                descriptionTemplates={descriptionTemplates}
                onDescriptionTemplateApply={onDescriptionTemplateApply}
                onDescriptionTemplateDelete={handleDeleteDescriptionTemplate}
                isProductSelected={isProductSelected}
              ></DescriptionPopover>
            </div>
          </div>
          <div className="filter-section" style={{ flex: "1 0 15%" }}>
            <div className="filter-label-div">
              <span>
                <b>Pricing</b>
              </span>
              <HelpDialog
                title="Pricing"
                content={PricingHelpContent}
              ></HelpDialog>
            </div>
            <PricingPopover
              width="100%"
              priceMultiplier={priceMultiplier}
              cents={cents}
              onCentsChange={setCents}
              onPricMultiplierChange={setPriceMultiplier}
              onApplyPricing={onApplyPricing}
              isProductSelected={isProductSelected}
            ></PricingPopover>
          </div>
          <div className="filter-section" style={{ flex: "1 0 15%" }}>
            <div className="filter-label-div">
              <span>
                <b>Choose Category</b>
              </span>
              <HelpDialog
                title="Categories"
                content={CategoryHelpContent}
              ></HelpDialog>
            </div>
            <CategoryPopover
              width="100%"
              onGroupSetCategories={onGroupSetCategories}
              isProductSelected={isProductSelected}
            ></CategoryPopover>
          </div>
          <div className="filter-section" style={{ flex: "1 0 15%" }}>
            <div className="filter-label-div">
              <span>
                <b>Choose tags</b>
              </span>
              <HelpDialog
                title="tags"
                content={TagsHelpContent}
              ></HelpDialog>
            </div>
            <TagPopover
              width="100%"
              onGroupSetTags={onGroupSetTags}
              isProductSelected={isProductSelected}
            ></TagPopover>
          </div>
          <div className="filter-section" style={{ flex: "1 0 15%" }}>
            <div className="filter-label-div">
              <span>
                <b>Properties</b>
              </span>
              <HelpDialog
                title="Properties"
                content={PropertiesHelpContent}
              ></HelpDialog>
            </div>
            <PropertiesPopover
              width="100%"
              options={options}
              onResetProperties={onResetProperties}
              onReplaceAll={onReplaceAll}
              onTransformPropertyValues={onTransformPropertyValues}
              onTranslateProperties={onTranslateProperties}
              onRefreshOptions={onRefreshOptions}
              openSnackBar={openSnackBar}
              isProductSelected={isProductSelected}
            ></PropertiesPopover>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: "70%",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              padding: "0 20px",
            }}
          >
            <span
              style={{
                marginRight: 20,
              }}
            >
              <b>Publish as:</b>
            </span>
            <FormControl>
              <RadioGroup
                row
                size="small"
                aria-labelledby="controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={postStatus}
                onChange={(e) => {
                  setPostStatus(e.target.value);
                }}
              >
                <FormControlLabel
                  value="publish"
                  control={<Radio />}
                  label={<span style={{ fontSize: "13px" }}>Publish</span>}
                />
                <FormControlLabel
                  value="draft"
                  control={<Radio />}
                  label={<span style={{ fontSize: "13px" }}>Draft</span>}
                />
                <FormControlLabel
                  value="pending"
                  control={<Radio />}
                  label={<span style={{ fontSize: "13px" }}>Pending</span>}
                />
              </RadioGroup>
            </FormControl>
            <LoadingButton
              loading={importInProgress}
              variant="contained"
              color="import_ultimus"
              style={{
                width: "25%",
                height: "30%",
                marginLeft: 25,
              }}
              size="small"
              onClick={() => onImportSelected(postStatus, priceMultiplier)}
              disabled={!isProductSelected}
            >
              IMPORT
            </LoadingButton>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "13%",
              marginRight: 20,
            }}
          >
            <span style={{ fontWeight: 600 }}>{selectedLength} selected</span>
            <Button
              variant="contained"
              size="small"
              color="primary_ultimus"
              onClick={() => onSelectAll(!isProductSelected)}
            >
              Select All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
