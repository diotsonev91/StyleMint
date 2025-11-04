package bg.softuni.stylemint.order.repository;

import bg.softuni.stylemint.order.model.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    long countByUserId(UUID userId);

    List<Order> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT SUM(oi.pricePerUnit * oi.quantity) FROM OrderItem oi " +
            "WHERE oi.order.userId = :userId")
    Double calculateTotalSpentByUser(@Param("userId") UUID userId);
}