import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const secSign = process.env.SECRET_SIGN;

const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  console.log("auth-token is ", token);
  console.log("secSign is ", secSign);
  // Check if not token is supplied:
  if (!token) {
    return res.status(401).send({ msg: "No Token Provided" });
  }
  try {
    const decodedData = jwt.verify(token, secSign);
    console.log("Decoded data", decodedData);
    req.userId = decodedData.user.id;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(500).send({ msg: "Internal Server Error" });
  }

  next();
};

export default fetchuser;
