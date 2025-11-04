package bg.softuni.stylemint.order.repository;

import bg.softuni.stylemint.order.model.OrderItem;
import bg.softuni.stylemint.order.enums.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    /**
     * Find all items for a specific order
     */
    List<OrderItem> findByOrderId(UUID orderId);

    /**
     * Fetch all items for multiple orders at once (avoids N+1 problem)
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id IN :orderIds")
    List<OrderItem> findByOrderIdIn(@Param("orderIds") List<UUID> orderIds);

    /**
     * Count items in an order
     */
    long countByOrderId(UUID orderId);

    /**
     * Check if a product exists in any order
     * Useful for: recommendation engine, product popularity
     */
    boolean existsByProductTypeAndProductId(ProductType productType, UUID productId);

    /**
     * Get all purchases of a specific product
     * Useful for: analytics, popular products
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.productType = :productType AND oi.productId = :productId")
    List<OrderItem> findProductPurchases(
            @Param("productType") ProductType productType,
            @Param("productId") UUID productId
    );

    /**
     * Get user's purchased products by type
     * Useful for: user profile, purchase history
     */
    @Query("SELECT oi FROM OrderItem oi " +
            "JOIN oi.order o " +
            "WHERE o.userId = :userId AND oi.productType = :productType")
    List<OrderItem> findUserPurchasesByProductType(
            @Param("userId") UUID userId,
            @Param("productType") ProductType productType
    );

    /**
     * Find items by product type
     * Useful for: filtering, reports
     */
    List<OrderItem> findByProductType(ProductType productType);
}