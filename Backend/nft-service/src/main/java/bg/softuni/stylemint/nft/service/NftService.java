package bg.softuni.stylemint.nft.service;

import bg.softuni.dtos.nft.*;
import bg.softuni.stylemint.blockchain.model.Transaction;
import bg.softuni.stylemint.blockchain.service.TransactionService;
import bg.softuni.stylemint.nft.exception.*;
import bg.softuni.stylemint.nft.model.*;
import bg.softuni.stylemint.nft.repository.PseudoTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NftService {

    private final PseudoTokenRepository tokenRepository;
    private final TransactionService transactionService;
    private final BadgeCertificatePdfService pdfService;

    public MintNftResponse mintNft(MintNftRequest request) {
        // Create token
        PseudoToken token = new PseudoToken();
        token.setOwnerId(request.getOwnerId());
        token.setNftType(request.getNftType());

        PseudoToken savedToken = tokenRepository.save(token);

        // Create blockchain transaction
        Transaction transaction = new Transaction();
        transaction.setToUserId(request.getOwnerId());
        transaction.setTokenId(savedToken.getTokenId());
        transaction.setNftType(request.getNftType());
        transaction.setTransactionType(Transaction.TransactionType.MINT);

        transactionService.processTransaction(transaction);

        // Build response
        MintNftResponse response = new MintNftResponse();
        response.setTokenId(savedToken.getTokenId());
        response.setTransactionId(transaction.getTransactionId());
        response.setMessage("NFT minted successfully");

        return response;
    }

    public UserNftsResponse getUserNfts(UUID userId) {
        List<PseudoToken> tokens = tokenRepository.findByOwnerId(userId);

        UserNftsResponse response = new UserNftsResponse();
        response.setUserId(userId);
        response.setNfts(tokens.stream()
                .map(this::mapToNftInfo)
                .collect(Collectors.toList()));

        return response;
    }

    public TransferNftResponse transferNft(TransferNftRequest request) {

        PseudoToken token = tokenRepository.findByTokenId(request.getTokenId())
                .orElseThrow(() -> new TokenNotFoundException("Token not found"));

        if (!token.getOwnerId().equals(request.getFromUserId())) {
            throw new InvalidOwnershipException("User does not own this token");
        }

        if (!token.isTransferable()) {
            throw new NonTransferableTokenException("This NFT is not transferable");
        }

        token.setOwnerId(request.getToUserId());
        tokenRepository.save(token);

        Transaction transaction = new Transaction();
        transaction.setFromUserId(request.getFromUserId());
        transaction.setToUserId(request.getToUserId());
        transaction.setTokenId(token.getTokenId());
        transaction.setNftType(token.getNftType());
        transaction.setTransactionType(Transaction.TransactionType.TRANSFER);

        transactionService.processTransaction(transaction);

        TransferNftResponse response = new TransferNftResponse();
        response.setTransactionId(transaction.getTransactionId());
        response.setMessage("NFT transferred successfully");

        return response;
    }

    public byte[] generateBadgeCertificatePdf(UUID tokenId, String ownerName) {
        PseudoToken token = tokenRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new TokenNotFoundException("Token not found"));

        if (!token.getNftType().isAuthorBadge()) {
            throw new CertificateGenerationException("Certificate can only be generated for author badges") {
            };
        }

        return pdfService.generateCertificatePdf(token, ownerName);
    }

    private UserNftsResponse.NftInfo mapToNftInfo(PseudoToken token) {
        UserNftsResponse.NftInfo nftInfo = new UserNftsResponse.NftInfo();
        nftInfo.setTokenId(token.getTokenId());
        nftInfo.setNftType(token.getNftType());
        nftInfo.setIsTransferable(token.isTransferable());
        nftInfo.setCreatedAt(token.getCreatedAt());
        return nftInfo;
    }
}