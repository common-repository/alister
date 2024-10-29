import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import { InventoryTableHelpContent, updateProductMeta } from "../../utlis";
import LoopIcon from "@mui/icons-material/Loop";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

import { visuallyHidden } from "@mui/utils";
import HelpDialog from "../shared/HelpDialog";
import { ImagePopover } from "../shared/ImagePopover";

import "../../styles/InventoryTable/InventoryTable.css";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headerCellBackground = "#f5f5f5";

const headCells = [
  {
    id: "index",
    align: "center",
    sortable: false,
    disablePadding: false,
    label: "",
  },
  {
    id: "image",
    align: "center",
    sortable: false,
    disablePadding: false,
    label: "Image",
  },
  {
    id: "name",
    align: "left",
    sortable: false,
    disablePadding: false,
    label: "Name",
    width: "20%",
  },
  {
    id: "source",
    align: "left",
    sortable: true,
    disablePadding: false,
    label: "Source",
  },
  {
    id: "status",
    align: "left",
    sortable: true,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "date-updated",
    align: "center",
    sortable: true,
    disablePadding: false,
    label: "Date updated",
  },
  {
    id: "action-bar",
    align: "center",
    sortable: false,
    disablePadding: false,
    label: "Action bar",
    width: "20%",
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow style={{ backgroundColor: headerCellBackground }}>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
            width={headCell.width}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
            {headCell.id == "index" && (
              <HelpDialog
                title="Inventory table"
                content={InventoryTableHelpContent}
              ></HelpDialog>
            )}
          </TableCell>
        ))}
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export const InventoryTable = (props) => {
  const openSnackBar = props.openSnackBar;
  const requestInProgress = props.requestInProgress;
  const setRequestInProgress = props.setRequestInProgress;
  const productBeingFetched = props.productBeingFetched;
  const loadSelectedProducts = props.loadSelectedProducts;
  const loadedGroups = props.loadedGroups;
  const handleTabChange = props.handleTabChange;

  const loadedProductAliIds = loadedGroups
    .map((lg) => lg.products.map((p) => p.productId))
    .flat();

  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState([]);
  const [rows, setRows] = React.useState([]);
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState(undefined);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [productCount, setProductCount] = React.useState(0);

  const [showTable, setShowTable] = React.useState(true);

  const [priceSettingsOpen, setPriceSettingsOpen] = React.useState(false);
  const [shippingPrice, setShippingPrice] = React.useState(null);
  const [priceMultiplier, setPriceMultiplier] = React.useState(null);
  const [priceSync, setPriceSync] = React.useState(null);
  const [priceSettingsId, setPriceSettingsId] = React.useState(null);

  useEffect(() => {
    getInventory();
  }, [page, rowsPerPage, order, orderBy, props.refreshInventory]);

  const getInventory = async () => {
    setRequestInProgress(true);
    try {
      let result = [];
      if (!false) {
        const response = await fetch(
          alisterData.url +
            "?" +
            new URLSearchParams({
              action: "alister_get_product_queue",
              page,
              per_page: rowsPerPage,
              order,
              order_by: orderBy ?? undefined,
            }),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error! status: ${response.status}`);
        }

        result = await response.json();
        setRows(
          result.data.map((item, index) => {
            return {
              ...item,
              status: item.product_status ? item.product_status : "Import List",
              exists: item.product ? true : false,
              "date-updated": item.update_at,
            };
          })
        );
        setProductCount(parseInt(result.count));
      }
      return result;
    } catch (err) {
      openSnackBar(err.message, "error");
    } finally {
      setRequestInProgress(false);
    }
  };

  const deleteProductsFromImportList = async () => {
    setRequestInProgress(true);
    const selectedProducts = rows.filter((p) => selected.includes(p.id));
    const results = await Promise.allSettled(
      selectedProducts.map((p) => {
        return fetch(alisterData.url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            action: "alister_remove_product",
            id: p.id,
            product_id: p.product || 0,
          }),
        });
      })
    );

    const removedPostIds = [];
    selectedProducts.map((sp, index) => {
      const r = results[index];
      if (r.status == "fulfilled" && r.value.ok) removedPostIds.push(sp.id);
    });
    const newSelected = selected.filter((id) => {
      return !removedPostIds.includes(id);
    });
    setSelected(newSelected);
    openSnackBar(
      `Removed ${removedPostIds.length} out of ${selected.length} products`,
      "info"
    );
    setRequestInProgress(false);
    getInventory();
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleOpenPriceSettings = (row) => {
    setPriceSettingsId(row.product);
    setPriceSync(row.product_details?.sync);
    setShippingPrice(row.product_details?.shipping_cost);
    setPriceMultiplier(row.product_details?.multiplier);
    setPriceSettingsOpen(true);
  };

  const handleClosePriceSettings = () => {
    setPriceSettingsOpen(false);
  };

  const handleLoadMultiple = () => {
    const productsToLoad = rows
      .filter((row) => {
        const isSelected = selected.includes(row.id);
        const isLoaded = loadedProductAliIds.includes(row.ali_id);
        const inImportList = !row.exists;
        return isSelected && !isLoaded && inImportList;
      })
      .map((p) => {
        return { id: p.ali_id, country: p.args?.country, lang: p.args?.lang, wooId: p.id, wooProductId: p.product || 0 };
      });
    if (productsToLoad.length > 0)
      loadSelectedProducts(productsToLoad, groupName);
  };

  const handleLoadProduct = (
    event,
    id,
    wooId,
    wooProductId,
    rowArgs,
    isLoaded = false,
    group = null
  ) => {
    event.stopPropagation();
    if (isLoaded && !group) return;
    if (isLoaded) {
      handleTabChange(group.id);
    } else {
      loadSelectedProducts(
        [
          {
            id,
            country: rowArgs?.country || "CH",
            lang: rowArgs?.lang || "de",
            wooId,
            wooProductId
          },
        ],
        id
      );
    }
  };

  const savePriceSettings = async () => {
    setRequestInProgress(true);
    try {
      await updateProductMeta(
        priceSettingsId,
        "alister_price_multiplier",
        priceMultiplier,
        openSnackBar
      );
      await updateProductMeta(
        priceSettingsId,
        "alister_shipping_cost",
        shippingPrice,
        openSnackBar
      );
      await updateProductMeta(
        priceSettingsId,
        "alister_sync_price",
        priceSync,
        openSnackBar
      );
    } catch (e) {
      console.log(e);
    }
    setRequestInProgress(false);
    getInventory();
  };

  const handleRowClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - productCount) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Dialog open={priceSettingsOpen} onClose={handleClosePriceSettings}>
        <DialogTitle>Price Settings</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span class="price-settings-input">Shipping price in USD</span>
              <input
                type="number"
                min="0"
                onChange={(event) => setShippingPrice(event.target.value)}
                value={shippingPrice}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                margin: "0px 20px",
              }}
            >
              <span class="price-settings-input">Price multiplier</span>
              <input
                type="number"
                min="0"
                onChange={(event) => setPriceMultiplier(event.target.value)}
                value={priceMultiplier}
              />
            </div>
            <FormGroup style={{ alignSelf: "self-end", marginBottom: 5 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={priceSync == "true"}
                    onChange={(event) =>
                      setPriceSync(event.target.checked ? "true" : "false")
                    }
                  />
                }
                label="Auto sync"
              />
            </FormGroup>
          </div>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            variant="outlined"
            loading={requestInProgress}
            onClick={(event) => savePriceSettings()}
            color="primary_ultimus"
            disabled={requestInProgress}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Toolbar
        style={{
          minHeight: 35,
          marginBottom: 20,
          padding: "0 4px",
          display: showTable ? "flex" : "none",
        }}
      >
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          <span style={{ fontWeight: "bold" }}>{selected.length} selected</span>
        </Typography>
        <Tooltip title="Optional name for the group import tab">
          <input
            style={{
              display: selected.length > 0 ? "flex" : "none",
              marginRight: 35,
            }}
            type={"text"}
            placeholder={"Group name"}
            onChange={(event) => setGroupName(event.target.value)}
            value={groupName}
          />
        </Tooltip>
        <Tooltip title="Fetch selected products">
          <span style={{ width: "20%", marginRight: 35 }}>
            <LoadingButton
              variant="contained"
              size="small"
              loading={productBeingFetched}
              onClick={(event) => {
                handleLoadMultiple();
              }}
              style={{ width: "100%" }}
              color={"primary_ultimus"}
              loadingPosition="start"
              disabled={
                selected.length <= 0 ||
                (requestInProgress && !productBeingFetched)
              }
            >
              {productBeingFetched ? "Fetching data" : "Load selected"}
            </LoadingButton>
          </span>
        </Tooltip>
        <Tooltip title="Delete">
          <span>
            <IconButton
              disabled={selected.length <= 0 || requestInProgress}
              color="primary_ultimus"
            >
              <DeleteIcon onClick={deleteProductsFromImportList} />
            </IconButton>
          </span>
        </Tooltip>
      </Toolbar>
      <Paper
        sx={{ width: "100%", mb: 2, display: showTable ? "block" : "none" }}
      >
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={"small"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy)).map(
                (row, index) => {
                  const isLoaded = loadedProductAliIds.includes(row.ali_id);
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  const itemGroup = loadedGroups.find((lg) => {
                    return lg.products.find((p) => p.productId == row.ali_id);
                  });

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      onClick={(e) => handleRowClick(e, row.id)}
                    >
                      <TableCell
                        align="center"
                        style={{ backgroundColor: headerCellBackground }}
                      >
                        {index}
                      </TableCell>
                      <TableCell align="center">
                        <ImagePopover
                          imageSource={row.image}
                          imageWidth="100"
                          popoverImageWidth="200"
                        ></ImagePopover>
                      </TableCell>
                      <TableCell align="left">
                        <a
                          href={`https://aliexpress.com/item/${row.ali_id}.html`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.name}
                        </a>
                      </TableCell>
                      <TableCell align="left">{row.source}</TableCell>
                      <TableCell align="left">{row.status}</TableCell>
                      <TableCell align="center">
                        {row["date-updated"]}
                      </TableCell>
                      <TableCell align="center">
                        {row.exists ? (
                          <div style={{ width: "100%" }}>
                            <IconButton
                              style={{ marginRight: 5 }}
                              href={row.edit_link}
                              target="_blank"
                              color="primary_ultimus"
                            >
                              <EditIcon></EditIcon>
                            </IconButton>
                            <Tooltip title="Price sync settings">
                              <IconButton
                                onClick={(event) =>
                                  handleOpenPriceSettings(row)
                                }
                                style={{
                                  color:
                                    row.product_details?.sync == "true"
                                      ? "#ff9800"
                                      : "#757575",
                                }}
                              >
                                <PriceChangeIcon></PriceChangeIcon>
                              </IconButton>
                            </Tooltip>
                          </div>
                        ) : (
                          <Tooltip
                            title={
                              isLoaded ? "Go to product tab" : "Fetch data"
                            }
                          >
                            <>
                              <LoadingButton
                                variant="contained"
                                loading={productBeingFetched == row.ali_id}
                                onClick={(event) =>
                                  handleLoadProduct(
                                    event,
                                    row.ali_id,
                                    row.id,
                                    row.product,
                                    row.args || {},
                                    isLoaded,
                                    itemGroup
                                  )
                                }
                                style={{ width: "100%" }}
                                color={
                                  isLoaded
                                    ? "enabled_ultimus"
                                    : "primary_ultimus"
                                }
                                loadingPosition="start"
                                disabled={
                                  requestInProgress &&
                                  !(productBeingFetched == row.ali_id)
                                }
                              >
                                {productBeingFetched == row.ali_id
                                  ? "Fetching data"
                                  : isLoaded
                                  ? "Loaded"
                                  : "Load"}
                              </LoadingButton>
                            </>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={(event) => handleClick(event, row.id)}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[20, 25, 50, 100]}
          component="div"
          count={productCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormGroup style={{ padding: 10, width: "fit-content" }}>
        <FormControlLabel
          control={
            <Switch
              color="primary_ultimus"
              size="small"
              defaultChecked
              checked={showTable}
              onChange={(event) => setShowTable(event.target.checked)}
            />
          }
          label={showTable ? "Hide Inventory" : "Show Inventory"}
        />
      </FormGroup>
    </Box>
  );
};
