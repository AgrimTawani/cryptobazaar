export function mapDiditDecisionToUser(decision: any) {
  const data: any = {};
  
  if (!decision) return data;

  if (decision.id_verifications && decision.id_verifications.length > 0) {
    const idData = decision.id_verifications[0];
    
    if (idData.date_of_birth) {
      const dob = new Date(idData.date_of_birth);
      if (!isNaN(dob.getTime())) {
        data.dateOfBirth = dob;
      }
    }
    
    if (idData.gender) {
      data.gender = idData.gender;
    }

    const docNum = idData.document_number;
    if (docNum) {
      const cleanDocNum = docNum.replace(/[\s-]/g, '').toUpperCase();
      const isAadhaar = /^\d{12}$/.test(cleanDocNum);
      const isPan = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanDocNum);

      if (isAadhaar) {
        data.aadhaarLast4 = cleanDocNum.slice(-4);
      } else if (isPan) {
        data.panMasked = `${cleanDocNum.slice(0, 2)}******${cleanDocNum.slice(-2)}`;
      } else {
        // If it's another document (like passport), we can safely store the last 4 digits in aadhaarLast4 as a generic ID field,
        // or just leave it blank. We will just leave it blank if it doesn't match Indian formats since the schema specifically says aadhaar/pan.
      }
    }
  }

  // Address (if Proof of Address is enabled)
  if (decision.poa_verifications && decision.poa_verifications.length > 0) {
    const poa = decision.poa_verifications[0];
    if (poa.full_address) data.address = poa.full_address;
    if (poa.city) data.city = poa.city;
    if (poa.state) data.state = poa.state;
    if (poa.zip_code) data.pincode = poa.zip_code;
  }
  
  // Phone (if Phone Verification is enabled)
  if (decision.phone_verifications && decision.phone_verifications.length > 0) {
     data.phone = decision.phone_verifications[0].phone_number;
  }

  return data;
}
