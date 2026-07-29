const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

class CustomEmbeddings extends GoogleGenerativeAIEmbeddings {
  constructor(fields) {
    super(fields);
    this.outputDimensionality = fields.outputDimensionality;
  }

  _convertToContent(text) {
    const base = super._convertToContent(text);
    if (this.outputDimensionality) {
      base.outputDimensionality = this.outputDimensionality;
    }
    return base;
  }
}

const embeddings = new CustomEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-2",
  outputDimensionality: 3072,
});

module.exports = embeddings;
