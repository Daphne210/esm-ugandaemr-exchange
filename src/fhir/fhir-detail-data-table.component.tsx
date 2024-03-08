import {
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
  Tile,
} from "@carbon/react";
import {
  isDesktop,
  useLayoutType,
  usePagination,
} from "@openmrs/esm-framework";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../components/data-table/data-tables.scss";
import { saveAs } from "file-saver";
import RowDetails from "./fhir-detail.component";
import { useGetFhirProfiles } from "./fhir.resource";

type FilterProps = {
  rowIds: Array<string>;
  headers: any;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

interface ListProps {
  columns: any;
  data: any;
}

type DocumentType = "csv" | "pdf" | "json";

const FhirProfileDataList: React.FC<ListProps> = ({ columns, data }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = useLayoutType() === "tablet";
  const responsiveSize = isTablet ? "lg" : "sm";
  const [allRows, setAllRows] = useState([]);
  const [list] = useState(data);
  const [documentType, setDocumentType] = useState<DocumentType>(null);
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const {
    goTo,
    results: paginatedList,
    currentPage,
  } = usePagination(data, currentPageSize);

  const handleFilter = ({
    rowIds,
    headers,
    cellsById,
    inputValue,
    getCellId,
  }: FilterProps): Array<string> => {
    return rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        const filterTerm = inputValue.toLowerCase();

        if (typeof filterableValue === "boolean") {
          return false;
        }

        return ("" + filterableValue).toLowerCase().includes(filterTerm);
      })
    );
  };

  useEffect(() => {
    const rows: Array<Record<string, string>> = [];

    paginatedList.map((item: any, index) => {
      return rows.push({ ...item, id: index++ });
    });
    setAllRows(rows);
  }, [paginatedList, allRows]);

  useEffect(() => {
    const csvString = convertToCSV(list, columns);
    if (documentType === "csv") {
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "data.csv");
    } else if (documentType === "json") {
      const jsonBlob = new Blob([csvString], { type: "application/json" });
      saveAs(jsonBlob, "data.json");
    }
  }, [list, columns, documentType]);

  const convertToCSV = (data, columns) => {
    const header = columns.map((col) => col.header).join(",");
    const rows = data.map((row) =>
      columns.map((col) => JSON.stringify(row[col.key])).join(",")
    );
    return [header, ...rows].join("\n");
  };
  return (
    <DataTable
      data-floating-menu-container
      rows={allRows}
      headers={columns}
      filterRows={handleFilter}
      overflowMenuOnHover={isDesktop(layout)}
      size={isTablet ? "lg" : "sm"}
      useZebraStyles
    >
      {({
        rows,
        headers,
        getRowProps,
        getHeaderProps,
        getTableProps,
        onInputChange,
      }) => (
        <div>
          <TableContainer className={styles.tableContainer}>
            <div className={styles.toolbarWrapper}>
              <TableToolbar size={responsiveSize}>
                <TableToolbarContent className={styles.toolbarContent}>
                  <TableToolbarSearch
                    className={styles.searchbox}
                    expanded
                    onChange={onInputChange}
                    placeholder={t("searchThisList", "Search this list")}
                    size={responsiveSize}
                  />

                  <TableToolbarMenu>
                    <TableToolbarAction
                      className={styles.toolbarAction}
                      onClick={() => setDocumentType("csv")}
                    >
                      Download as CSV
                    </TableToolbarAction>
                    <TableToolbarAction
                      className={styles.toolbarAction}
                      disabled
                      onClick={() => setDocumentType("pdf")}
                    >
                      Download as PDF
                    </TableToolbarAction>
                    <TableToolbarAction
                      className={styles.toolbarAction}
                      onClick={() => setDocumentType("json")}
                    >
                      Download as JSON
                    </TableToolbarAction>
                  </TableToolbarMenu>
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow
                          className={styles.expandedActiveVisitRow}
                          colSpan={headers.length + 1}
                        >
                          <RowDetails
                            selectedProfileData={data.find((item) => item.uuid)}
                          />
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow
                          className={styles.hiddenRow}
                          colSpan={headers.length + 1}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t("No data", "No data to display")}
                    </p>
                  </div>
                </Tile>
              </div>
            ) : null}
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={currentPageSize}
              pageSizes={pageSizes}
              totalItems={data?.length}
              className={styles.pagination}
              onChange={({ pageSize, page }) => {
                if (pageSize !== currentPageSize) {
                  setPageSize(pageSize);
                }
                if (page !== currentPage) {
                  goTo(page);
                }
              }}
            />
          </TableContainer>
        </div>
      )}
    </DataTable>
  );
};

export default FhirProfileDataList;
