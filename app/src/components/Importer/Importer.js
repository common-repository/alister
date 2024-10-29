import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  IconButton,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { ProductEditor } from "./ProductEditor/ProductEditor";
import { GroupModifier } from "./GroupModifier/GroupModifier";
import { ImagePopover } from "../shared/ImagePopover";
import { findLongestMatchInDict, transformPropertiesForAI } from "../../utlis";

import "../../styles/Importer/Importer.css";
import AccordionMenu from "./AccordionMenu";
import { LoadingBar } from "../shared/LoadingBar";

export const Importer = React.memo(
  (props) => {
    const {
      groupId,
      products,
      options,
      descriptionTemplates,
      aiDescriptionTemplates,
      aiTitleTemplates,
      onRefreshOptions,
      onRefreshDescriptionTemplates,
      onGroupImportStatusChange,
      onRemoveProductFromGroup,
      onDeleteProductFromGroup,
      onRefreshInventory,
      openSnackBar,
    } = props;

    const [groupProducts, setGroupProducts] = React.useState(products);
    const [selectedProducts, setSelectedProducts] = React.useState([]);
    const [importInProgress, setImportInProgress] = React.useState(false);
    const [AIProgressRate, setAIProgressRate] = React.useState(100);
    const [generationInProgress, setGenerationInProgress] =
      React.useState(false);


    const addNewProduct = async (product, postStatus, priceMultiplier) => {
      const {
        productId,
        productTitle,
        productUrl,
        categories,
        tags,
        productDescription,
        productImages,
        properties,
        variations,
        carrierSelected,
        shippingCarriers,
      } = product;
      const attributes = [];
      // Transform properties
      Object.keys(properties).forEach((key) => {
        attributes.push({ name: properties[key].name, values: [] });
        const currentIndex = attributes.length - 1;
        Object.keys(properties[key].values).forEach((valueKey) => {
          if (properties[key].values[valueKey].active) {
            attributes[currentIndex]["values"].push(
              properties[key].values[valueKey].name
            );
          }
        });
      });

      // Remove attributes if they have only one possible value
      const filteredAttributes = attributes.filter((attr) => {
        return attr["values"].length > 1;
      });

      // Sort attributes values alphabetically
      filteredAttributes.forEach((fa) => {
        fa.values = [...fa.values].sort();
      });

      const filteredAttributeNames = filteredAttributes.map((fa) => fa.name);

      // Handle gallery images
      const newImages = productImages.filter((img) => img.selected);

      // Determine if the product is actually simple
      const vars = variations.filter((v) => !v.skip);
      const realProductType = vars.length == 1 ? "simple" : "variable";

      // get pricing data
      let shippingPrice = null;
      let shippingCarrier = null;
      if (carrierSelected) {
        shippingPrice = shippingCarriers.find((c) => {
          return c.company.id == carrierSelected;
        }).price.value;
        shippingCarrier = carrierSelected;
      }

      try {
        const data = {
          type: "POST",
          url: alisterData.url,
          data: {
            action: "alister_add_product",
            type: realProductType,
            productId,
            name: productTitle,
            sku: "p" + variations[0].sku,
            foreign_sku: variations[0].foreign_sku,
            description: productDescription,
            image: newImages[0].url,
            images: [...newImages],
            price: variations[0].storePrice,
            categories: categories.map((c) => c.cat_ID),
            tags: tags.map((t) => t.term_id),
            attributes: filteredAttributes,
            url: productUrl,
            postStatus: postStatus,
            shipping_carrier: shippingCarrier,
            shipping_price: shippingPrice,
            price_multiplier: priceMultiplier,
          },
        };

        let response = null;
        try {
          response = await jQuery.ajax(data);
        } catch (e) {
          throw Error(e.statusText);
        }

        if (!response || response.statusCode == 500) {
          const errorMessage = response.message
            ? response.message
            : "Internal Server Error";
          throw new Error(errorMessage);
        }

        product.permalink = response.permalink;

        if (realProductType == "variable") {
          let varLength = parseFloat(vars.length);
          let i = 0.0;
          for (const variation of vars) {
            await addVariationToProduct(
              variation,
              response.wc_product_id,
              filteredAttributeNames,
              productUrl
            );
            i++;
            product.importProgress = ((i / varLength) * 100).toFixed();
            setGroupProducts([...groupProducts]);
          }
        } else {
          product.importProgress = 100;
          setGroupProducts([...groupProducts]);
        }

        openSnackBar("Product added", "success");
      } catch (err) {
        openSnackBar(`${err}`, "error");
      }
    };

    const addVariationToProduct = async (
      variation,
      parentId,
      validAttributes = [],
      productUrl
    ) => {
      const attributes = {};

      // TODO: check if this is a distinction between override and import
      if (Array.isArray(variation.properties)) {
        variation.properties.forEach((property) => {
          attributes[property.name] = property.value.name;
        });
      } else {
        Object.keys(variation.properties).forEach((key) => {
          attributes[key.replace(/^(pa_)/, "")] = variation.properties[key];
        });
      }

      const filteredAttributes = {};
      Object.keys(attributes).forEach((k) => {
        if (validAttributes.includes(k)) {
          filteredAttributes[k] = attributes[k];
        }
      });

      const attributeArray = [];
      Object.keys(filteredAttributes).forEach((k) => {
        attributeArray.push({
          name: k,
          value: filteredAttributes[k],
        });
      });

      const data = {
        type: "POST",
        url: alisterData.url,
        data: {
          action: "alister_add_product",
          parentId,
          type: "variation",
          foreign_sku: variation.foreign_sku,
          image: variation.img,
          sku: variation.sku,
          url: productUrl,
          external_varid: variation.sku,
          price: variation.storePrice,
          attributes: attributeArray,
        },
      };
      const response = await jQuery.ajax(data);

      if (!response) {
        throw new Error(
          `Error! failed to add variation ${variation.foreign_sku}`
        );
      }
    };

    const handleSelectProduct = (event, id) => {
      event.stopPropagation();
      const selectedIndex = selectedProducts.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selectedProducts, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selectedProducts.slice(1));
      } else if (selectedIndex === selectedProducts.length - 1) {
        newSelected = newSelected.concat(selectedProducts.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selectedProducts.slice(0, selectedIndex),
          selectedProducts.slice(selectedIndex + 1)
        );
      }

      setSelectedProducts(newSelected);
    };

    const handleSelectAllClick = (selectAll) => {
      if (selectAll) {
        const newSelected = groupProducts.map((p) => p.productId);
        setSelectedProducts(newSelected);
        return;
      }
      setSelectedProducts([]);
    };

    function isSelected(id) {
      return selectedProducts.indexOf(id) !== -1;
    }

    const handleTitleChange = (productId, value) => {
      const product = groupProducts.find((p) => p.productId === productId);
      if (product) {
        product.productTitle = value;
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    const handleProductImagesChange = (productId, images) => {
      const product = groupProducts.find((p) => p.productId === productId);
      if (product) {
        product.productImages = images;
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    const handleDescriptionChange = (productId, value) => {
      const product = groupProducts.find((p) => p.productId === productId);
      if (product) {
        product.productDescription = value;
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    const handleCarrierSelectedChange = (productId, value) => {
      const product = groupProducts.find((p) => p.productId === productId);
      if (product) {
        product.carrierSelected = value;
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    const handleCategoryChange = (productId, value) => {
      const product = groupProducts.find((p) => p.productId === productId);
      if (product) {
        product.categories = value;
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    
    const handleTagChange = (productId, value) => {
      const product = groupProducts.find((p) => p.productId === productId);
      if (product) {
        product.tags = value;
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    const handlePropertyUpdate = (productId, id, data) => {
      const product = groupProducts.find((p) => p.productId == productId);
      if (product) {
        const { properties, variations } = product;
        properties[id] = data;
        product.timestamp = new Date();
        applyPropertyChangeOnVariations(properties, variations);
      }
    };

    const handleEnableAllVariations = (productId) => {
      const product = groupProducts.find((p) => p.productId == productId);
      if (product) {
        const variations = product.variations;
        const isSomeVariationSkipped = variations.some((v) => v.skip);
        if (isSomeVariationSkipped) {
          variations.forEach((v) => {
            v.skip = false;
          });
        } else {
          variations.forEach((v) => {
            v.skip = true;
          });
        }
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    const handleChangeApplyTransformations = (
      productId,
      propertyKey,
      checked
    ) => {
      const product = groupProducts.find((p) => p.productId == productId);
      if (product) {
        const properties = product.properties;
        properties[propertyKey].applyTransformations = checked;
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    const applyPropertyChangeOnVariations = (properties, variations) => {
      variations.forEach((variation) => {
        let hasInactiveProperty = false;
        variation.properties.forEach((variationProperty) => {
          const propId = variationProperty["id"];
          const propValueId = variationProperty["value"]["id"];
          variationProperty["name"] = properties[propId]["name"];
          variationProperty["value"]["name"] =
            properties[propId]["values"][propValueId]["name"];
          if (!properties[propId]["values"][propValueId]["active"])
            hasInactiveProperty = true;
        });
        variation.skip = hasInactiveProperty;
      });
      setGroupProducts([...groupProducts]);
    };

    const handleVariationSkip = (productId, value, sku) => {
      const product = groupProducts.find((p) => p.productId == productId);
      if (product) {
        const variation = product.variations.find((k) => k.foreign_sku == sku);
        variation.skip = !value;
        product.timestamp = new Date();
        setGroupProducts([...groupProducts]);
      }
    };

    const handleCloseProduct = (productId) => {
      const productsLength = groupProducts.length;
      const filteredProducts = groupProducts.filter(
        (p) => p.productId != productId
      );
      if (productsLength != filteredProducts.length) {
        setGroupProducts([...filteredProducts]);
        onRemoveProductFromGroup(filteredProducts, groupId);
      }
    };

    const handleDeleteProduct = (productId) => {
      const productsLength = groupProducts.length;
      const filteredProducts = groupProducts.filter(
        (p) => p.productId != productId
      );
      if (productsLength != filteredProducts.length) {
        setGroupProducts([...filteredProducts]);
        onDeleteProductFromGroup(filteredProducts, groupId, productId);
      }
    };

    // Group operations
    const handleImportSelected = async (postStatus, priceMultiplier) => {
      if (importInProgress) return;
      try {
        onGroupImportStatusChange(groupId, "inProgress");
        setImportInProgress(true);
        for (const productId of selectedProducts) {
          const product = groupProducts.find((p) => p.productId == productId);
          if (product) {
            await addNewProduct(product, postStatus, priceMultiplier);
          }
        }
        onGroupImportStatusChange(groupId, "done");
      } catch (err) {
        openSnackBar(`${err}`, "error");
        onGroupImportStatusChange(groupId, "error");
      } finally {
        setImportInProgress(false);
        onRefreshInventory(new Date());
        setGroupProducts([...groupProducts]);
      }
    };

    const handleDescriptioTemplateApply = (templateText) => {
      const productsLength = selectedProducts.length;
      if (productsLength <= 0) return;
      let index = 1;
      setAIProgressRate(0);
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product && templateText != "") {
          let replacedValue = templateText.replace(
            /\{\{price\}\}/g,
            product.variations[0].storePrice != "0"
              ? product.variations[0].storePrice
              : product.variations[0].aliPrice
          );
          replacedValue = replacedValue.replace(
            /\{\{title\}\}/g,
            product.productTitle
          );
          product.productDescription =
            product.productDescription + "\n" + replacedValue;
          product.timestamp = new Date();
        }
        setAIProgressRate(((index / productsLength) * 100).toFixed());
        index += 1;
      }
      setGroupProducts([...groupProducts]);
    };

    const handleGenerateAIDescriptionTitle = async (prompt, command) => {
      const productsLength = selectedProducts.length;
      if (productsLength <= 0) return;
      setGenerationInProgress(true);
      let index = 1;
      setAIProgressRate(0);
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product && prompt != "") {
          let replacedValue = prompt.replace(
            /\{\{ali_title\}\}/g,
            product.productTitle
          );

          replacedValue = replacedValue.replace(
            /\{\{ali_description\}\}/g,
            product.aliDescription
          );

          const propertyString = transformPropertiesForAI(product.properties);
          replacedValue = replacedValue.replace(
            /\{\{ali_properties\}\}/g,
            propertyString.join("\n")
          );

          const response = await fetch(
            alisterData.url +
              "?" +
              new URLSearchParams({
                action: "alister_get_open_ai_product_data",
                prompt: replacedValue,
              }),
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            openSnackBar(`Could not generate product ${command}`, "warning");
          }
          const result = await response.json();
          if (command == "description") {
            product.productDescription =
              product.productDescription + "\n" + result.text;
          } else {
            product.productTitle = result.text;
          }
          product.timestamp = new Date();
        }
        setAIProgressRate(((index / productsLength) * 100).toFixed());
        index += 1;
      }
      setGroupProducts([...groupProducts]);
      setGenerationInProgress(false);
    };

    const handleReplaceAll = (findTextValue, replaceTextValue, ignoreCase) => {
      if (selectedProducts.length <= 0) return;
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product) {
          const { properties, variations } = product;
          Object.keys(properties).forEach((propertyKey) => {
            if (properties[propertyKey].applyTransformations) {
              const property = properties[propertyKey];
              Object.keys(property["values"]).forEach((valueKey) => {
                const value = property["values"][valueKey];
                let regex = new RegExp(`${findTextValue}`, "g");
                if (ignoreCase) regex = new RegExp(`${findTextValue}`, "gi");
                value["name"] = value["name"].replace(regex, replaceTextValue);
              });
            }
          });
          product.timestamp = new Date();
          applyPropertyChangeOnVariations(properties, variations);
        }
      }
    };

    const handleResetProperties = () => {
      if (selectedProducts.length <= 0) return;
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product) {
          const { properties, variations, originalProperties } = product;
          let clone = JSON.parse(JSON.stringify(originalProperties));
          Object.keys(properties).forEach((propKey) => {
            if (!properties[propKey].applyTransformations) {
              clone[propKey] = properties[propKey];
            }
          });
          product.properties = clone;
          product.timestamp = new Date();
          applyPropertyChangeOnVariations(clone, variations);
        }
      }
    };

    const handleValueTransformation = (numerical) => {
      if (selectedProducts.length <= 0) return;
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product) {
          const { properties, variations } = product;
          Object.keys(properties).forEach((propertyKey) => {
            const property = properties[propertyKey];
            if (property.applyTransformations) {
              let numberValue = 1;
              let charcode = 96;
              Object.keys(property["values"]).map((valueKye) => {
                const value = property["values"][valueKye];
                if (value["active"]) {
                  if (numerical) {
                    value.name = numberValue.toString();
                  } else {
                    charcode = charcode == 122 ? 93 : charcode + 1;
                    value.name = String.fromCharCode(charcode).toUpperCase();
                  }
                  numberValue++;
                }
              });
            }
          });
          product.timestamp = new Date();
          applyPropertyChangeOnVariations(properties, variations);
        }
      }
    };

    const handleTranslateProperties = () => {
      if (selectedProducts.length <= 0) return;
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product) {
          const { properties, variations } = product;
          const dictKeys = Object.keys(options["property_dictionary"]);
          if (dictKeys.length == 0) return;
          const sortedKeys = dictKeys.sort((a, b) => {
            return b.length - a.length;
          });
          Object.keys(properties).forEach((key) => {
            const property = properties[key];
            if (property.applyTransformations) {
              property.name = findLongestMatchInDict(
                sortedKeys,
                property.name,
                options["property_dictionary"]
              );
              Object.keys(property["values"]).forEach((valueKey) => {
                const value = property["values"][valueKey];
                // Replace with dict value
                value["name"] = findLongestMatchInDict(
                  sortedKeys,
                  value["name"],
                  options["property_dictionary"]
                );
              });
            }
          });
          product.timestamp = new Date();
          applyPropertyChangeOnVariations(properties, variations);
        }
      }
    };

    const handleApplyPricing = (priceMultiplier, cents) => {
      if (selectedProducts.length <= 0 || isNaN(priceMultiplier)) return;
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product) {
          const { carrierSelected, shippingCarriers, variations } = product;
          let shippingPrice = 0;
          if (carrierSelected) {
            shippingPrice = shippingCarriers.find((c) => {
              return c.company.id == carrierSelected;
            }).price.value;
          }

          const modifiedVariations = variations.map((v) => {
            let sp = (parseFloat(v.aliPrice) + parseFloat(shippingPrice)) * parseFloat(priceMultiplier)
            let cnts = parseFloat(cents)
            if (cnts) {
              sp = Math.floor(sp) + cnts/100
            }
            return {
              ...v,
              storePrice: sp
                .toFixed(2)
                .toString(),
            };
          });
          product.variations = modifiedVariations;
          product.timestamp = new Date();
          setGroupProducts([...groupProducts]);
        }
      }
    };

    const handleGroupSetCategories = (categories) => {
      if (selectedProducts.length <= 0 || categories.length == 0) return;
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product) {
          const cat_ids = product.categories.map((c) => c.cat_ID);
          for (const cat of categories) {
            if (!cat_ids.includes(cat.cat_ID)) {
              product.categories = [...product.categories, cat];
            }
          }
          product.timestamp = new Date();
          setGroupProducts([...groupProducts]);
        }
      }
    };

    const handleGroupSetTags = (tags) => {
      if (selectedProducts.length <= 0 || tags.length == 0) return;
      for (const productId of selectedProducts) {
        const product = groupProducts.find((p) => p.productId == productId);
        if (product) {
          const tag_ids = product.tags.map((c) => c.term_id);
          for (const tag of tags) {
            if (!tag_ids.includes(tag.term_id)) {
              product.tags = [...product.tags, tag];
            }
          }
          product.timestamp = new Date();
          setGroupProducts([...groupProducts]);
        }
      }
    };

    const permalinks = groupProducts
      .filter((p) => p.permalink != "")
      .map((p) => p.permalink);

    return (
      <div>
        <GroupModifier
          descriptionTemplates={descriptionTemplates}
          aiDescriptionTemplates={aiDescriptionTemplates}
          aiTitleTemplates={aiTitleTemplates}
          selectedLength={selectedProducts.length}
          options={options}
          onSelectAll={handleSelectAllClick}
          onImportSelected={handleImportSelected}
          importInProgress={importInProgress}
          AIProgressRate={AIProgressRate}
          generationInProgress={generationInProgress}
          onAIDescriptionTitleApply={handleGenerateAIDescriptionTitle}
          onDescriptionTemplateApply={handleDescriptioTemplateApply}
          onRefreshDescriptionTemplates={onRefreshDescriptionTemplates}
          onRefreshOptions={onRefreshOptions}
          onReplaceAll={handleReplaceAll}
          onTransformPropertyValues={handleValueTransformation}
          onTranslateProperties={handleTranslateProperties}
          onGroupSetCategories={handleGroupSetCategories}
          onGroupSetTags={handleGroupSetTags}
          onApplyPricing={handleApplyPricing}
          onResetProperties={handleResetProperties}
          openSnackBar={openSnackBar}
        ></GroupModifier>
        <div
          style={{
            display: permalinks.length == 0 ? "none" : "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            margin: "10px 0",
          }}
        >
          <span
            style={{
              textAlign: "left",
              marginRight: 15,
            }}
          >
            <b>Permalinks:</b>
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", padding: 15 }}>
            {permalinks.map((permalink) => {
              return (
                <div className="permalink-div">
                  <a href={permalink} target="_blank">
                    {permalink}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
        {groupProducts.map((product) => {
          return (
            <Accordion key={product.productId}>
              <AccordionSummary
                style={{
                  borderLeft: isSelected(product.productId)
                    ? "10px solid #d0db7a"
                    : "none",
                  paddingLeft: 10,
                }}
              >
                <span
                  className="visible-on-hover"
                  style={{ position: "absolute", bottom: 10, right: 13 }}
                >
                  <i>click to expand</i>
                </span>
                <span style={{ position: "absolute", top: 0, right: 0 }}>
                  <AccordionMenu
                    onCloseProduct={handleCloseProduct}
                    onDeleteProduct={handleDeleteProduct}
                    productId={product.productId}
                    groupId={groupId}
                  ></AccordionMenu>
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ImagePopover
                    imageSource={product.productImages[0]?.url}
                    imageWidth="100px"
                    popoverImageWidth="250"
                  ></ImagePopover>
                  <span
                    style={{ width: "25%", marginLeft: 15, marginRight: 15 }}
                  >
                    <b>{product.productTitle}</b>
                  </span>
                  <span>
                    <IconButton
                      color="primary_ultimus"
                      href={product.url}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </span>
                  <div
                    style={{
                      width: "40%",
                      marginLeft: "auto",
                    }}
                  >
                    <LoadingBar
                      loadingWidth={product.importProgress}
                      styles={{ marginBottom: 15 }}
                    ></LoadingBar>
                  </div>
                  <Checkbox
                    style={{ marginLeft: 15, marginBottom: 11 }}
                    color="primary"
                    checked={isSelected(product.productId)}
                    onClick={(event) =>
                      handleSelectProduct(event, product.productId)
                    }
                  />
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <ProductEditor
                  productData={product}
                  openSnackBar={openSnackBar}
                  timestamp={product.timestamp}
                  onTitleChange={handleTitleChange}
                  onProductImagesChange={handleProductImagesChange}
                  onDescriptionChange={handleDescriptionChange}
                  onCarrierSelectedChange={handleCarrierSelectedChange}
                  onCategoryChange={handleCategoryChange}
                  onTagChange={handleTagChange}
                  onPropertyUpdate={handlePropertyUpdate}
                  onVariationSkip={handleVariationSkip}
                  onEnableAllVariations={handleEnableAllVariations}
                  onChangeApplyTransformations={
                    handleChangeApplyTransformations
                  }
                  onRefreshDescriptionTemplates={onRefreshDescriptionTemplates}
                ></ProductEditor>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    );
  },
  (prev, next) => prev.refreshImporters == next.refreshImporters
);
