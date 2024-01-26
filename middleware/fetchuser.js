import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const secSign = process.env.SECRET_SIGN;

const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  // Check if not token is supplied:
  if (!token) {
    return res.status(401).send({ msg: "Token not provided. Please log in." });
  }
  try {
    const decodedData = jwt.verify(token, secSign);
    req.userId = decodedData.user.id;
  } catch (error) {
    return res
      .status(500)
      .send({ msg: "Please authenticate using a valid token" });
  }

  next();
};

export default fetchuser;
