package bg.softuni.stylemint.nft.service;

import bg.softuni.dtos.enums.nft.NftType;
import bg.softuni.stylemint.nft.model.PseudoToken;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class BadgeCertificatePdfService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());

    public byte[] generateCertificatePdf(PseudoToken token, String ownerName) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);

            document.open();

            // Title
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD);
            Paragraph title = new Paragraph("NFT Author Badge Certificate", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(30);
            document.add(title);

            // Content
            Font labelFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Font valueFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL);

            document.add(createLabelValueParagraph("Issued to:", ownerName, labelFont, valueFont));
            document.add(createLabelValueParagraph("Badge Type:", token.getNftType().name(), labelFont, valueFont));
            document.add(createLabelValueParagraph("Date Issued:", formatDate(token.getCreatedAt()), labelFont, valueFont));
            document.add(createLabelValueParagraph("NFT Hash:", formatHash(token.getTokenId().toString()), labelFont, valueFont));

            // Description
            Paragraph descParagraph = new Paragraph();
            descParagraph.add(new Chunk("Description: ", labelFont));
            descParagraph.setSpacingBefore(20);
            document.add(descParagraph);

            Font descFont = new Font(Font.FontFamily.HELVETICA, 11, Font.ITALIC);
            Paragraph description = new Paragraph(getDescription(token.getNftType()), descFont);
            description.setSpacingAfter(20);
            document.add(description);

            // Footer
            Font footerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC);
            Paragraph footer = new Paragraph("This certificate is valid as long as the NFT is held by the owner.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(40);
            document.add(footer);

            document.close();
            return outputStream.toByteArray();

        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF certificate", e);
        }
    }

    private Paragraph createLabelValueParagraph(String label, String value, Font labelFont, Font valueFont) {
        Paragraph paragraph = new Paragraph();
        paragraph.add(new Chunk(label + " ", labelFont));
        paragraph.add(new Chunk(value, valueFont));
        paragraph.setSpacingAfter(10);
        return paragraph;
    }

    private String formatDate(Long timestamp) {
        return DATE_FORMATTER.format(Instant.ofEpochMilli(timestamp));
    }

    private String formatHash(String hash) {
        if (hash.length() > 12) {
            return "0x" + hash.substring(0, 8).toUpperCase() + "...";
        }
        return "0x" + hash.toUpperCase();
    }

    private String getDescription(NftType nftType) {
        return switch (nftType) {
            case AUTHOR_BADGE_DESIGNER ->
                    "This badge certifies the user's contribution as an approved designer and content creator in the StyleMint ecosystem.";
            case AUTHOR_BADGE_PRODUCER ->
                    "This badge certifies the user's contribution as an approved producer and content creator in the StyleMint ecosystem.";
            default ->
                    "This badge certifies the user's contribution in the StyleMint ecosystem.";
        };
    }
}