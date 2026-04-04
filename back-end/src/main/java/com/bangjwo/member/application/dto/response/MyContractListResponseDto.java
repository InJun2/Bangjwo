package com.bangjwo.member.application.dto.response;

import java.util.List;
import com.bangjwo.global.common.page.PageResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "내 계약 목록을 페이징 형태로 전달하는 DTO")
public class MyContractListResponseDto extends PageResponse<MyContractItemDto> {

	public MyContractListResponseDto(Integer totalItems, Integer currentPage, Integer size, List<MyContractItemDto> items) {
		super(totalItems, currentPage, size, items);
	}

	public MyContractListResponseDto(Integer totalItems, Integer currentPage, List<MyContractItemDto> items) {
		super(totalItems, currentPage, items);
	}
}