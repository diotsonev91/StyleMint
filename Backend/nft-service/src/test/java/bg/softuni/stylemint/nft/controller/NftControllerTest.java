package bg.softuni.stylemint.nft.controller;

import bg.softuni.dtos.enums.nft.NftType;
import bg.softuni.dtos.nft.*;
import bg.softuni.stylemint.nft.service.NftService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NftController.class)
class NftControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NftService nftService;

    @Test
    void mintNft_ShouldReturnMintNftResponse() throws Exception {
        // Arrange
        UUID ownerId = UUID.randomUUID();
        UUID tokenId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        MintNftRequest request = new MintNftRequest();
        request.setOwnerId(ownerId);
        request.setNftType(NftType.NFT_DISCOUNT_5);

        MintNftResponse response = new MintNftResponse();
        response.setTokenId(tokenId);
        response.setTransactionId(transactionId);
        response.setMessage("NFT minted successfully");

        when(nftService.mintNft(any(MintNftRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/nft/mint")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenId", is(tokenId.toString())))
                .andExpect(jsonPath("$.transactionId", is(transactionId.toString())))
                .andExpect(jsonPath("$.message", is("NFT minted successfully")));
    }

    @Test
    void mintNft_WithDiscountToken_ShouldReturnSuccess() throws Exception {
        // Arrange
        UUID ownerId = UUID.randomUUID();
        UUID tokenId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        MintNftRequest request = new MintNftRequest();
        request.setOwnerId(ownerId);
        request.setNftType(NftType.NFT_DISCOUNT_7);

        MintNftResponse response = new MintNftResponse();
        response.setTokenId(tokenId);
        response.setTransactionId(transactionId);
        response.setMessage("Discount NFT minted");

        when(nftService.mintNft(any(MintNftRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/nft/mint")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenId", is(tokenId.toString())))
                .andExpect(jsonPath("$.transactionId", is(transactionId.toString())))
                .andExpect(jsonPath("$.message", is("Discount NFT minted")));
    }

    @Test
    void mintNft_WithAuthorBadge_ShouldReturnSuccess() throws Exception {
        // Arrange
        UUID ownerId = UUID.randomUUID();
        UUID tokenId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        MintNftRequest request = new MintNftRequest();
        request.setOwnerId(ownerId);
        request.setNftType(NftType.AUTHOR_BADGE_DESIGNER);

        MintNftResponse response = new MintNftResponse();
        response.setTokenId(tokenId);
        response.setTransactionId(transactionId);
        response.setMessage("Author badge minted");

        when(nftService.mintNft(any(MintNftRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/nft/mint")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenId", is(tokenId.toString())))
                .andExpect(jsonPath("$.transactionId", is(transactionId.toString())))
                .andExpect(jsonPath("$.message", is("Author badge minted")));
    }

    @Test
    void getUserNfts_ShouldReturnUserNftsResponse() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();
        UUID tokenId1 = UUID.randomUUID();
        UUID tokenId2 = UUID.randomUUID();

        UserNftsResponse.NftInfo nft1 = new UserNftsResponse.NftInfo();
        nft1.setTokenId(tokenId1);
        nft1.setNftType(NftType.NFT_DISCOUNT_5);
        nft1.setIsTransferable(true);
        nft1.setCreatedAt(System.currentTimeMillis());

        UserNftsResponse.NftInfo nft2 = new UserNftsResponse.NftInfo();
        nft2.setTokenId(tokenId2);
        nft2.setNftType(NftType.AUTHOR_BADGE_DESIGNER);
        nft2.setIsTransferable(false);
        nft2.setCreatedAt(System.currentTimeMillis());

        UserNftsResponse response = new UserNftsResponse();
        response.setUserId(userId);
        response.setNfts(List.of(nft1, nft2));

        when(nftService.getUserNfts(userId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/nft/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(userId.toString())))
                .andExpect(jsonPath("$.nfts", hasSize(2)))
                .andExpect(jsonPath("$.nfts[0].tokenId", is(tokenId1.toString())))
                .andExpect(jsonPath("$.nfts[0].nftType", is("NFT_DISCOUNT_5")))
                .andExpect(jsonPath("$.nfts[0].isTransferable", is(true)))
                .andExpect(jsonPath("$.nfts[1].tokenId", is(tokenId2.toString())))
                .andExpect(jsonPath("$.nfts[1].nftType", is("AUTHOR_BADGE_DESIGNER")))
                .andExpect(jsonPath("$.nfts[1].isTransferable", is(false)));
    }

    @Test
    void getUserNfts_WithEmptyList_ShouldReturnEmptyNftsList() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();

        UserNftsResponse response = new UserNftsResponse();
        response.setUserId(userId);
        response.setNfts(List.of());

        when(nftService.getUserNfts(userId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/nft/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(userId.toString())))
                .andExpect(jsonPath("$.nfts", hasSize(0)));
    }

    @Test
    void transferNft_ShouldReturnTransferNftResponse() throws Exception {
        // Arrange
        UUID tokenId = UUID.randomUUID();
        UUID fromUserId = UUID.randomUUID();
        UUID toUserId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        TransferNftRequest request = new TransferNftRequest();
        request.setTokenId(tokenId);
        request.setFromUserId(fromUserId);
        request.setToUserId(toUserId);

        TransferNftResponse response = new TransferNftResponse();
        response.setTransactionId(transactionId);
        response.setMessage("NFT transferred successfully");

        when(nftService.transferNft(any(TransferNftRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/nft/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId", is(transactionId.toString())))
                .andExpect(jsonPath("$.message", is("NFT transferred successfully")));
    }

    @Test
    void transferNft_WithValidDiscountToken_ShouldReturnSuccess() throws Exception {
        // Arrange
        UUID tokenId = UUID.randomUUID();
        UUID fromUserId = UUID.randomUUID();
        UUID toUserId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        TransferNftRequest request = new TransferNftRequest();
        request.setTokenId(tokenId);
        request.setFromUserId(fromUserId);
        request.setToUserId(toUserId);

        TransferNftResponse response = new TransferNftResponse();
        response.setTransactionId(transactionId);
        response.setMessage("Discount token transferred");

        when(nftService.transferNft(any(TransferNftRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/nft/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId", is(transactionId.toString())))
                .andExpect(jsonPath("$.message", is("Discount token transferred")));
    }

    @Test
    void downloadBadgeCertificate_ShouldReturnPdfBytes() throws Exception {
        // Arrange
        UUID tokenId = UUID.randomUUID();
        String ownerName = "John Doe";
        byte[] pdfBytes = "mock-pdf-content".getBytes();

        when(nftService.generateBadgeCertificatePdf(eq(tokenId), eq(ownerName)))
                .thenReturn(pdfBytes);

        // Act & Assert
        mockMvc.perform(get("/api/nft/badge/certificate/{tokenId}", tokenId)
                        .param("ownerName", ownerName))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    void downloadBadgeCertificate_WithDifferentOwner_ShouldReturnPdf() throws Exception {
        // Arrange
        UUID tokenId = UUID.randomUUID();
        String ownerName = "Jane Smith";
        byte[] pdfBytes = "another-mock-pdf-content".getBytes();

        when(nftService.generateBadgeCertificatePdf(eq(tokenId), eq(ownerName)))
                .thenReturn(pdfBytes);

        // Act & Assert
        mockMvc.perform(get("/api/nft/badge/certificate/{tokenId}", tokenId)
                        .param("ownerName", ownerName))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition",
                        "form-data; name=\"attachment\"; filename=\"badge-certificate.pdf\""))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    void mintNft_WithInvalidRequest_ShouldHandleGracefully() throws Exception {
        // Arrange
        String invalidJson = "{\"ownerId\": \"not-a-uuid\"}";

        // Act & Assert
        mockMvc.perform(post("/api/nft/mint")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void transferNft_WithInvalidRequest_ShouldHandleGracefully() throws Exception {
        // Arrange
        String invalidJson = "{\"tokenId\": \"not-a-uuid\"}";

        // Act & Assert
        mockMvc.perform(post("/api/nft/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().is4xxClientError());
    }
}