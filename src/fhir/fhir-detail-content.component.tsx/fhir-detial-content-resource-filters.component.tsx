import React, { useState } from "react";
import { Dropdown, Form, FormGroup, Stack, TextInput } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { useGetPatientIdentifierType } from "../fhir.resource";
import { caseBasedPrimaryResourceTypes } from "../../constants";
import styles from "../fhir-detail.scss";

const ResourceFilters = () => {
  const { t } = useTranslation();

  const { patientIdentifierTypes } = useGetPatientIdentifierType();

  const dropdownPatientIdentifierItems = patientIdentifierTypes.map((type) => ({
    id: type.uuid,
    label: type.display,
  }));

  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelectionChange = (selectedItem) => {
    setSelectedItem(selectedItem);
  };

  return (
    <div className={styles.formContainer}>
      <div className={`${styles.form} ${styles.formFirst}`}>
        <Form>
          <Stack gap={2}>
            <FormGroup>
              <Dropdown
                id="dropdown-1"
                titleText={t(
                  "patientIdentifierType",
                  "Patient Identifier Type"
                )}
                items={dropdownPatientIdentifierItems}
                selectedItem={selectedItem}
                onChange={(event) => handleSelectionChange(event.selectedItem)}
                itemToString={(item) => (item ? item.label : "")}
                label="Select Patient Identifier Type"
              />
            </FormGroup>
            <FormGroup>
              <TextInput
                type="number"
                labelText={t(
                  "patientIdentifierSourceId",
                  "Patient Identifier Source ID"
                )}
                id="patient-identifier-source-id"
              />
            </FormGroup>
            <FormGroup>
              <TextInput
                type="text"
                labelText={t("encounterTypeUuids", "Encounter Type UUIDS")}
                id="encounter-type-uuids"
              />
            </FormGroup>
            <FormGroup>
              <TextInput
                type="text"
                labelText={t("observationConceptId", "Observation Concept IDs")}
                id="observation-concept-id"
              />
            </FormGroup>
          </Stack>
        </Form>
      </div>
      <div className={`${styles.form} ${styles.formRight}`}>
        <Form>
          <Stack gap={2}>
            <FormGroup>
              <TextInput
                type="text"
                labelText={t(
                  "episodeOfCareUuids",
                  "Episode of Care (Program) UUIDS"
                )}
                id="episode-of-care"
              />
            </FormGroup>
          </Stack>
        </Form>
      </div>
    </div>
  );
};

export default ResourceFilters;