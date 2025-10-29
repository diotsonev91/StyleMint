package bg.softuni.stylemint.order.repository;

import bg.softuni.stylemint.order.model.Order;
import bg.softuni.stylemint.order.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {


    List<Order> findByUserId(UUID userId);

    /**
     * Find all orders by user ID ordered by creation date descending
     */
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);


    List<Order> findByUserIdAndStatus(UUID userId, OrderStatus status);


    List<Order> findByStatus(OrderStatus status);


    List<Order> findByCreatedAtAfter(OffsetDateTime date);


    List<Order> findByUserIdAndCreatedAtBetween(
            UUID userId,
            OffsetDateTime startDate,
            OffsetDateTime endDate
    );

    /**
     * Count orders by user ID
     */
    long countByUserId(UUID userId);

    /**
     * Count orders by status
     */
    long countByStatus(OrderStatus status);

    /**
     * Check if user has any orders
     */
    boolean existsByUserId(UUID userId);

    /**
     * Find most recent order by user ID
     */
    Optional<Order> findTopByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Custom query: Find orders with specific status for a user
     */
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findUserOrdersByStatus(@Param("userId") UUID userId, @Param("status") OrderStatus status);

    /**
     * Custom query: Get order statistics by status
     */
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getOrderStatisticsByStatus();
}