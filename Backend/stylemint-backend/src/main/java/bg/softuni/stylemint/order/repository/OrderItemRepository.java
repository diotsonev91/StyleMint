package bg.softuni.stylemint.order.repository;

import bg.softuni.stylemint.order.model.OrderItem;
import bg.softuni.stylemint.order.model.Order;
import bg.softuni.stylemint.order.enums.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {


    List<OrderItem> findByOrder(Order order);


    List<OrderItem> findByOrderId(UUID orderId);


    List<OrderItem> findByProductType(ProductType productType);


    List<OrderItem> findByProductTypeAndProductId(ProductType productType, UUID productId);

    /**
     * Find items by order and product type
     */
    List<OrderItem> findByOrderAndProductType(Order order, ProductType productType);

    /**
     * Count items in an order
     */
    long countByOrder(Order order);

    /**
     * Count items by order ID
     */
    long countByOrderId(UUID orderId);

    /**
     * Check if a product exists in any order
     */
    boolean existsByProductTypeAndProductId(ProductType productType, UUID productId);


    /**
     * Custom query: Get all purchases of a specific product
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.productType = :productType AND oi.productId = :productId")
    List<OrderItem> findProductPurchases(
            @Param("productType") ProductType productType,
            @Param("productId") UUID productId
    );

    /**
     * Custom query: Get user's purchased products by type
     */
    @Query("SELECT oi FROM OrderItem oi " +
            "JOIN oi.order o " +
            "WHERE o.userId = :userId AND oi.productType = :productType")
    List<OrderItem> findUserPurchasesByProductType(
            @Param("userId") UUID userId,
            @Param("productType") ProductType productType
    );
}
