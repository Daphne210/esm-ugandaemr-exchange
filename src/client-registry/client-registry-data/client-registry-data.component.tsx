import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  extractErrorMessagesFromResponse,
  startClientRegistryTask,
  usePatients,
} from "../client-registry.resource";
import {
  ExtensionSlot,
  formatDate,
  parseDate,
  showNotification,
  showSnackbar,
} from "@openmrs/esm-framework";
import {
  DataTable,
  TableContainer,
  Pagination,
  Tile,
  TableBody,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  DataTableSkeleton,
  Button,
  InlineLoading,
} from "@carbon/react";
import styles from "./client-registry-data.scss";
import { OverflowMenuVertical } from "@carbon/react/icons";

import OrderCustomOverflowMenuComponent from "../../ui-components/overflow-menu.component";

const ClientRegistryData: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const {
    patients,
    isLoading: loading,
    mutate,
  } = usePatients(debouncedSearchQuery, false);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedPatientEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return patients?.slice(startIndex, endIndex) || [];
  }, [patients, currentPage, currentPageSize]);

  const tableHeaders = useMemo(
    () => [
      { id: 0, header: t("name", "Name"), key: "name" },
      { id: 1, header: t("identifiers", "Identifiers"), key: "identifiers" },
      { id: 2, header: t("gender", "Gender"), key: "gender" },
      { id: 3, header: t("age", "Age"), key: "age" },
      { id: 4, header: t("birthdate", "Birthdate"), key: "birthdate" },
      {
        id: 5,
        header: t("maritalStatus", "Marital Status"),
        key: "maritalStatus",
      },
      { id: 6, header: t("occupation", "Occupation"), key: "occupation" },
      { id: 7, header: t("nationality", "Nationality"), key: "nationality" },
      { id: 8, header: t("dead", "Dead"), key: "dead" },
      { id: 9, actions: t("actions", "Actions"), key: "actions" },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return paginatedPatientEntries.map((patient, index) => ({
      ...patient,
      id: patient?.uuid,
      name: patient?.person?.display,
      identifiers: patient.identifiers
        .map((identifier) => identifier.display)
        .join(", "),
      gender: patient?.person?.gender,
      age: patient?.person?.age,
      birthdate: formatDate(parseDate(patient?.person?.birthdate)),
      maritalStatus:
        patient.attributes.find(
          (attribute) =>
            attribute.attributeType?.uuid ===
            "8d871f2a-c2cc-11de-8d13-0010c6dffd0f"
        )?.value?.display || "",
      occupation:
        patient.attributes.find(
          (attribute) =>
            attribute.attributeType?.uuid ===
            "b0868a16-4f8e-43da-abfc-6338c9d8f56a"
        )?.value || "",
      nationality:
        patient.attributes.find(
          (attribute) =>
            attribute.attributeType?.uuid ===
            "dec484be-1c43-416a-9ad0-18bd9ef28929"
        )?.value?.display || "",
      dead: patient?.person?.dead ? "true" : "false",
      actions: (
        <OrderCustomOverflowMenuComponent
          menuTitle={
            <>
              <OverflowMenuVertical
                size={16}
                style={{ marginLeft: "0.3rem" }}
              />
            </>
          }
        >
          <ExtensionSlot
            className={styles.menuLink}
            state={{ patient: paginatedPatientEntries[index] }}
            name="cr-patients-actions-slot"
          />
        </OrderCustomOverflowMenuComponent>
      ),
    }));
  }, [paginatedPatientEntries]);

  const startClientRegistry = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    startClientRegistryTask().then(
      () => {
        mutate();
        setIsLoading(false);
        showSnackbar({
          isLowContrast: true,
          title: t("runTask", "Start Client Registry Task"),
          kind: "success",
          subtitle: t(
            "successfullyStarted",
            `You have successfully started Client Registry`
          ),
        });
      },
      (error) => {
        const errorMessages = extractErrorMessagesFromResponse(error);

        mutate();
        setIsLoading(false);
        showNotification({
          title: t("errorStartingTask", "Error Starting client registry task"),
          kind: "error",
          critical: true,
          description: errorMessages.join(", "),
        });
      }
    );
  };

  const handlePageChange = ({ pageSize, page }) => {
    if (pageSize !== currentPageSize) {
      setPageSize(pageSize);
      setCurrentPage(1); // Reset to the first page when page size changes
    } else if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return <DataTableSkeleton />;
  }

  return (
    <div style={{ margin: "1rem" }}>
      <div
        style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="Search patients"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            marginRight: "2rem",
            marginLeft: "1rem",
            padding: "0.5rem",
            flex: "1",
          }}
        />
        <Button
          style={{ marginLeft: "1rem" }}
          onClick={(e) => startClientRegistry(e)}
          kind="primary"
        >
          {isLoading ? <InlineLoading /> : "Send All to CR"}
        </Button>
      </div>
      <DataTable rows={tableRows} headers={tableHeaders} useZebraStyles>
        {({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            {...getTableContainerProps()}
            className={styles.tableContainer}
          >
            <Table {...getTableProps()} aria-label="patients">
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
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id} className={styles.testCell}>
                        {cell.value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t("noPatientsToDisplay", "No patients to display")}
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
              totalItems={patients?.length || 0} // Reflect the total number of patients
              className={styles.pagination}
              onChange={handlePageChange}
            />
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default ClientRegistryData;
