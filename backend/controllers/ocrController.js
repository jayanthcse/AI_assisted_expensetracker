const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// @desc    Scan receipt image
// @route   POST /api/ocr/scan
// @access  Private
const scanBill = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
        const filePath = path.join(__dirname, '../uploads', req.file.filename);

        // Perform OCR
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
            logger: m => console.log(m)
        });

        // Clean up file
        fs.unlinkSync(filePath);

        // Parse Text
        // Simple heuristic for Total Amount: Look for highest number with currency symbol or just decimal
        // Date: Look for date formats

        const amountRegex = /\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/g;
        const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/g;

        let amounts = [];
        let match;
        while ((match = amountRegex.exec(text)) !== null) {
            // Remove commas and $
            const val = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(val)) amounts.push(val);
        }

        // Heuristic: Total is usually the largest amount found, or labelled "Total"
        // For simplicity, take max amount.
        const detectedAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

        // Date
        const dateMatch = text.match(dateRegex);
        const detectedDate = dateMatch ? new Date(dateMatch[0]) : new Date();

        res.status(200).json({
            text,
            amount: detectedAmount,
            date: detectedDate,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'OCR failed' });
    }
};

module.exports = {
    scanBill,
};
