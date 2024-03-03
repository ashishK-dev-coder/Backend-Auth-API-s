// One minute Expiry
const oneMinuteExpiry = async (otpTime) => {
  try {
    console.log("Timestamp is--" + otpTime);

    const current_data = new Date();
    let differenceValue = (otpTime - current_data.getTime()) / 1000;
    differenceValue /= 60;

    console.log("Expiry--" + Math.abs(differenceValue));

    if (Math.abs(differenceValue) > 1) {
      return true;
    }

    return false;
  } catch (error) {
    console.log(error);
  }
};

// Three minute Expiry
const threeMinuteExpiry = async (otpTime) => {
  try {
    console.log("Timestamp is--" + otpTime);

    const current_data = new Date();
    let differenceValue = (otpTime - current_data.getTime()) / 1000;
    differenceValue /= 60;

    console.log("Expiry--" + Math.abs(differenceValue));

    if (Math.abs(differenceValue) > 3) {
      return true;
    }

    return false;
  } catch (error) {
    console.log(error);
  }
};

export { oneMinuteExpiry, threeMinuteExpiry };
