package com.smartcampus.maintenance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.smartcampus.maintenance.dto.ticket.TicketAssignmentRecommendationResponse;
import com.smartcampus.maintenance.entity.Building;
import com.smartcampus.maintenance.entity.RequestType;
import com.smartcampus.maintenance.entity.ServiceDomain;
import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AutoAssignmentServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Test
    void ranksCandidatesUsingJavaScoring() {
        User lowLoad = maintenanceUser(31L, "casey", "Casey Technician");
        User specialist = maintenanceUser(32L, "miriam", "Miriam Specialist");
        when(userRepository.findByRoleOrderByFullNameAsc(Role.MAINTENANCE)).thenReturn(List.of(lowLoad, specialist));
        stubCandidateMetrics(lowLoad.getId(), 2L, 1L, 0L, 1L);
        stubCandidateMetrics(specialist.getId(), 5L, 6L, 3L, 4L);

        AutoAssignmentService service = new AutoAssignmentService(
                userRepository,
                ticketRepository);

        List<TicketAssignmentRecommendationResponse> recommendations = service.recommendAssignees(sampleTicket(), 3);

        assertThat(recommendations).hasSize(2);
        assertThat(recommendations.getFirst().userId()).isEqualTo(specialist.getId());
        assertThat(recommendations.getFirst().reasons()).anySatisfy(reason -> assertThat(reason).contains("similar"));
    }

    @Test
    void prefersLowestWorkloadWhenSignalsAreOtherwiseEqual() {
        User alpha = maintenanceUser(31L, "alpha", "Alpha Crew");
        User bravo = maintenanceUser(32L, "bravo", "Bravo Crew");
        when(userRepository.findByRoleOrderByFullNameAsc(Role.MAINTENANCE)).thenReturn(List.of(alpha, bravo));
        stubCandidateMetrics(alpha.getId(), 1L, 0L, 0L, 0L);
        stubCandidateMetrics(bravo.getId(), 8L, 0L, 0L, 0L);

        AutoAssignmentService service = new AutoAssignmentService(
                userRepository,
                ticketRepository);

        List<TicketAssignmentRecommendationResponse> recommendations = service.recommendAssignees(sampleTicket(), 2);

        assertThat(recommendations).hasSize(2);
        assertThat(recommendations.getFirst().userId()).isEqualTo(alpha.getId());
        assertThat(recommendations.getFirst().score()).isGreaterThan(recommendations.get(1).score());
    }

    private void stubCandidateMetrics(Long userId, long activeOpen, long sameDomain, long sameBuilding, long recent) {
        EnumSet<com.smartcampus.maintenance.entity.enums.TicketStatus> resolvedStates = EnumSet.of(
                com.smartcampus.maintenance.entity.enums.TicketStatus.RESOLVED,
                com.smartcampus.maintenance.entity.enums.TicketStatus.CLOSED);
        when(ticketRepository.countByAssignedToId(userId)).thenReturn(activeOpen + 1);
        when(ticketRepository.countByAssignedToIdAndStatusIn(eq(userId), eq(resolvedStates))).thenReturn(1L);
        when(ticketRepository.countByAssignedToIdAndRequestType_ServiceDomain_KeyAndStatusIn(eq(userId), eq("IT"), eq(resolvedStates)))
                .thenReturn(sameDomain);
        when(ticketRepository.countByAssignedToIdAndBuildingRecord_IdAndStatusIn(eq(userId), eq(7L), eq(resolvedStates)))
                .thenReturn(sameBuilding);
        when(ticketRepository.countByAssignedToIdAndResolvedAtAfterAndStatusIn(eq(userId), any(LocalDateTime.class), eq(resolvedStates)))
                .thenReturn(recent);
    }

    private Ticket sampleTicket() {
        ServiceDomain serviceDomain = new ServiceDomain();
        serviceDomain.setKey("IT");
        serviceDomain.setLabel("IT");

        RequestType requestType = new RequestType();
        requestType.setId(99L);
        requestType.setLabel("Printer Support");
        requestType.setServiceDomain(serviceDomain);

        Building building = new Building();
        building.setId(7L);
        building.setName("Main Library");
        building.setCode("LIB");

        Ticket ticket = new Ticket();
        ticket.setId(200L);
        ticket.setTitle("Printer jam");
        ticket.setRequestType(requestType);
        ticket.setBuildingRecord(building);
        return ticket;
    }

    private User maintenanceUser(Long id, String username, String fullName) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setFullName(fullName);
        user.setRole(Role.MAINTENANCE);
        return user;
    }
}
