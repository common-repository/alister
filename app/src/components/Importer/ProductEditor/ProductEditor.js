import React from "react";
import {
  Grid,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Tooltip,
  Switch,
  Button
} from "@mui/material";

import ImageGallery from "./ImageGallery";
import { TextEditor } from "./TextEditor";
import { OptionEditor } from "./OptionEditor";
import { CategorySelector } from "../../shared/CategorySelector";
import { TagSelector } from "../../shared/TagSelector";
import SortFilterTable from "../../shared/SortFilterTable";
import { ImagePopover } from "../../shared/ImagePopover";

import "../../../styles/Importer/ProductEditor/ProductEditor.css";

const buttonSize = "medium";

const SkipVariation = (props) => {
  const handleSkip = props.onAction;
  const skipArgs = props.actionArgs;
  const productId = props.productId;
  return (
    <Switch
      checked={!skipArgs[0]}
      onChange={(event) =>
        handleSkip(productId, event.target.checked, skipArgs[1])
      }
    />
  );
};

export const ProductEditor = React.memo(
  (props) => {
    const {
      productData,
      openSnackBar,
      onTitleChange,
      onProductImagesChange,
      onDescriptionChange,
      onCarrierSelectedChange,
      onCategoryChange,
      onTagChange,
      onPropertyUpdate,
      onVariationSkip,
      onRefreshDescriptionTemplates,
      onChangeApplyTransformations,
      onEnableAllVariations,
    } = props;

    const {
      productId,
      productTitle,
      productDescription,
      categories,
      tags,
      carrierSelected,
      shippingCarriers,
      productImages,
      variations,
      properties,
    } = productData;


    // Temporary measure
    const getVariationHeaders = (variations) => {
      if (variations.length > 0) {
        return [
          {
            id: "image",
            numeric: false,
            label: "Image",
            width: "12%",
            disableSort: true,
          },
          {
            id: "foreignSku",
            numeric: false,
            label: "Foreign SKU",
            width: "30%",
          },
          ...variations[0].properties.map((vp) => {
            return {
              id: vp.id,
              numeric: false,
              label: vp.name,
              width: `${45 / variations[0].properties.length}%`,
            };
          }),
          {
            id: "stock",
            numeric: false,
            label: "Stock",
            width: "auto",
          },
          {
            id: "price",
            numeric: false,
            label: "Price",
            width: "auto",
          },
          {
            id: "storePrice",
            numeric: false,
            label: "Store Price",
            width: "auto",
          },
          {
            id: "skip",
            isAction: true,
            numeric: false,
            label: "Enabled",
            width: "auto",
          },
        ];
      }
      return [];
    };

    const getVariationRows = (variations) => {
      return variations.map((v) => {
        const propertiesTemp = {};
        v.properties.map((vp) => {
          propertiesTemp[vp.id] = vp.value.name;
        });
        return {
          image: (
            <ImagePopover
              imageSource={v.img}
              imageWidth="60px"
              popoverImageWidth="300"
            />
          ),
          foreignSku: v.foreign_sku,
          ...propertiesTemp,
          stock: v.stock,
          price: v.aliPrice,
          storePrice: v.storePrice,
          skip: v.skip,
          enabled: !v.skip
        };
      });
    };

    const actionDict = {
      skip: {
        actionComponent: SkipVariation,
        handleAction: onVariationSkip,
      },
    };

    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                width: "100%",
              }}
            >
              <Tooltip title="Title as it appears in your store">
                <span className="product-editor-label">
                  <b>Title</b>
                </span>
              </Tooltip>
              <input
                type="text"
                className="custom-input generic-background-color"
                value={productTitle}
                onChange={(e) => onTitleChange(productId, e.target.value)}
                style={{ width: "100%" }}
              ></input>
              <Tooltip title="Your store category">
                <span className="product-editor-label">
                  <b>Description</b>
                </span>
              </Tooltip>
            </div>
            <TextEditor
              size={buttonSize}
              onDescriptionChange={onDescriptionChange}
              productDescription={productDescription}
              openSnackBar={openSnackBar}
              productId={productId}
              onRefreshDescriptionTemplates={onRefreshDescriptionTemplates}
            />
          </div>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <ImageGallery
              size={buttonSize}
              images={productImages}
              onChangeImages={onProductImagesChange}
              productId={productId}
            />
            <Grid item xs={12}>
              <span className="product-editor-label">
                <b>Category</b>
              </span>
            </Grid>
            <Grid item xs={12}>
              <CategorySelector
                onCategoryChange={(categories) =>
                  onCategoryChange(productId, categories)
                }
                categories={categories}
              ></CategorySelector>
            </Grid>
            <Grid item xs={12}>
              <span className="product-editor-label">
                <b>Tags</b>
              </span>
            </Grid>
            <Grid item xs={12}>
              <TagSelector
                onTagChange={(tags) =>
                  onTagChange(productId, tags)
                }
                tags={tags}
              ></TagSelector>
            </Grid>
            <Grid item xs={12}>
              <span className="product-editor-label">
                <b>Shipping</b>
              </span>
            </Grid>
            <Grid item xs={12}>
              <Tooltip title="Sum the product price and this shipping methods price">
                <FormControl style={{ width: "100%" }} size="small">
                  <InputLabel id="shipping-select-label">Carrier</InputLabel>
                  <Select
                    labelId="shipping-select-label"
                    id="shipping-select"
                    value={carrierSelected}
                    label="Shipping"
                    onChange={(e) => {
                      onCarrierSelectedChange(productId, e.target.value);
                    }}
                  >
                    {shippingCarriers.map((sc) => {
                      return (
                        <MenuItem value={sc.company.id}>
                          {sc.company.name} - {sc.price.value} USD
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {Object.keys(properties).length > 0 && (
            <Grid
              id="bottom-grid"
              container
              spacing={2}
              sx={{
                borderWidth: 1,
                borderColor: "#ddd",
                marginTop: 1,
              }}
            >
              <Grid
                item
                xs={8}
                style={{
                  border: 1,
                  borderWidth: 1,
                  borderColor: "#ddd",
                }}
              >
                <div className="generic-background-color">
                  <OptionEditor
                    properties={properties}
                    onPropertyUpdate={onPropertyUpdate}
                    onChangeApplyTransformations={onChangeApplyTransformations}
                    productId={productId}
                  ></OptionEditor>
                </div>
              </Grid>
              <Grid item xs={4} sx={{textAlign: "end"}}>
              <Button
              variant="contained"
              size="small"
              color="primary_ultimus"
              onClick={() => onEnableAllVariations(productId)}
            >
              Enable All
            </Button>
              </Grid>
            </Grid>
          )}
          <Grid>
            <Grid item xs={12}>
              <SortFilterTable
                headers={getVariationHeaders(variations)}
                rows={getVariationRows(variations)}
                actionDict={actionDict}
                actionArgIds={["skip", "foreignSku"]}
                productId={productId}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                maxTableHeight="500px"
              ></SortFilterTable>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  },
  (prevProps, nextProps) => {
    const prevTimestamp = prevProps.timestamp;
    const nextTimestamp = nextProps.timestamp;
    return prevTimestamp == nextTimestamp;
  }
);
