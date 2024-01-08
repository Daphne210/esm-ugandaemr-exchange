import React, { useEffect, useMemo, useState } from "react";
import { InlineLoading, InlineNotification } from "@carbon/react";
import styles from "./vl-suppression-prediction.scss";
import {
  extractDate,
  useGetCurrentRegimen,
  useGetAherence,
  useGetARTStartDate,
  useGetLastEncounterDate,
  useGetIndicationForVLTesting,
  useVLSuppressionDetails,
  validateVLSuppressionParams,
} from "./vl-suppression-prediction.resource";
import logo from "../../assets/images/artificial-intelligence-logo.png";
import { PatientChartProps } from "../../types";
import { usePatient } from "@openmrs/esm-framework";

const VLSuppressionPredictionWorkSpace: React.FC<PatientChartProps> = ({
  patientUuid,
}) => {
  const { patient } = usePatient(patientUuid);

  const [indicationError, setIndicationError] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const [encounterDate, setEncounterDate] = useState<string | null>("");
  const handleLastEncounterDateReceived = (newLastEncounterDate: string) => {
    setEncounterDate(newLastEncounterDate);
  };

  const [artStartDate, setArtStartDate] = useState("");
  const handleArtStartDateDataReceived = (newArtStartDate: string) => {
    setArtStartDate(newArtStartDate);
  };

  const [currentRegimen, setCurrentRegimen] = useState("");
  const handleCurrentRegimenReceived = (newCurrentRegimen: string) => {
    setCurrentRegimen(newCurrentRegimen);
  };

  const [arvAdherence, setArvAdherence] = useState("");
  const handleAdherenceReceived = (newAdherenceReceivedRecieved: string) => {
    setArvAdherence(newAdherenceReceivedRecieved);
  };

  const [indicationForVLTesting, setIndicationForVLTesting] = useState("");
  const handleIndicationForVLTestingReceived = (
    newIndicationForVLTesting: string
  ) => {
    if (
      newIndicationForVLTesting ===
      "No parameter for last_indication_for_VL_Testing"
    ) {
      setIndicationError(newIndicationForVLTesting);
    } else {
      setIndicationForVLTesting(newIndicationForVLTesting);
      setIndicationError("");
    }
  };

  useGetARTStartDate(
    {
      patientuuid: patientUuid,
    },
    handleArtStartDateDataReceived,
    "ab505422-26d9-41f1-a079-c3d222000440"
  );

  useGetLastEncounterDate(
    {
      patientuuid: patientUuid,
    },
    handleLastEncounterDateReceived,
    "59f36196-3ebe-4fea-be92-6fc9551c3a11"
  );

  useGetCurrentRegimen(
    {
      patientuuid: patientUuid,
    },
    handleCurrentRegimenReceived,
    "dd2b0b4d-30ab-102d-86b0-7a5022ba4115"
  );

  useGetIndicationForVLTesting(
    { patientuuid: patientUuid },
    handleIndicationForVLTestingReceived,
    "59f36196-3ebe-4fea-be92-6fc9551c3a11"
  );

  useGetAherence(
    { patientuuid: patientUuid },
    handleAdherenceReceived,
    "dce03b2f-30ab-102d-86b0-7a5022ba4115"
  );

  const gender = useMemo(() => {
    return patient ? patient.gender : "Female";
  }, [patient]);

  const dateOfBirth = useMemo(() => {
    return patient ? extractDate(patient.birthDate) : "";
  }, [patient]);

  const patientDisplay = useMemo(() => {
    return patient
      ? `${patient.name[0].given.join(" ")} ${patient.name[0].family}`
      : "Patient";
  }, [patient]);

  const [showPredictions, setshowPredictions] = useState(true);

  const { data, isErrorInSendingRequest, isLoadingPrediction } =
    useVLSuppressionDetails({
      last_encounter_date: encounterDate,
      art_start_date: artStartDate,
      date_birth: dateOfBirth,
      gender: gender,
      last_arv_adherence: arvAdherence,
      current_regimen: currentRegimen,
      last_indication_for_VL_Testing: indicationForVLTesting,
    });

  const [validationError, setValidationError] = useState<string | null>(null);
  useEffect(() => {
    const error = validateVLSuppressionParams({
      last_encounter_date: encounterDate,
      art_start_date: artStartDate,
      date_birth: dateOfBirth,
      gender: gender,
      last_arv_adherence: arvAdherence,
      current_regimen: currentRegimen,
      last_indication_for_VL_Testing: indicationForVLTesting,
    });
    setValidationError(error);
  }, [
    encounterDate,
    artStartDate,
    dateOfBirth,
    gender,
    arvAdherence,
    currentRegimen,
    indicationForVLTesting,
  ]);

  const handleCloseNotification = () => {
    setShowErrorNotification(false);
  };

  return (
    <>
      <section className={styles.sectionHeader}>
        <div className={styles.sectionHeaderContent}>
          <img src={logo} alt="logo" height={60} />
          <div>Welcome to Dr. Yonna</div>
          <p>Your AI Partner</p>
        </div>
        <span className={styles.divSpan}>
          An AI based diagnostic assessment for {patientDisplay}
        </span>
      </section>
      {!validationError ? (
        <>
          {isLoadingPrediction && (
            <InlineLoading
              status="active"
              iconDescription="Loading"
              description="Loading data..."
            />
          )}
          {isErrorInSendingRequest && (
            <InlineLoading
              status="active"
              iconDescription="Loading"
              description="Getting Patient Details..."
            />
          )}
          {!isLoadingPrediction && !isErrorInSendingRequest && (
            <>
              {showPredictions && (
                <section className={styles.section}>
                  <div className={styles.title}>Viral Load Suppression</div>
                  <div className={styles.divVL}>
                    Prediction: <>{data}</>
                  </div>
                </section>
              )}
            </>
          )}
        </>
      ) : (
        <InlineNotification
          kind="error"
          onClose={handleCloseNotification}
          title={validationError}
        />
      )}
    </>
  );
};

export default VLSuppressionPredictionWorkSpace;