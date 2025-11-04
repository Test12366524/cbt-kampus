import { apiSlice } from "@/services/base-query";
import type {
  PaginatedResponse,
  ItemResponse,
  ParticipantHistoryItem,
  ParticipantTest,
  ContinueTestResponse,
  ContinueTestData,
  ActiveCategoryResponse,
  ParticipantQuestionCategory,
  EndCategoryResponse,
  EndCategoryData,
  EndSessionResponse,
  SaveAnswerPayload,
  ResetAnswerPayload,
  FlagQuestionPayload,
  AnswerResponse,
  GenerateTestPayload,
  GenerateTestResponse,
} from "@/types/student/tryout";

export type ParticipantHistoryFilters = {
  page?: number;
  paginate?: number;
  search?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  is_ongoing?: 0 | 1;
  is_completed?: 0 | 1;
  orderBy?: string;
  searchBySpecific?: string;
  test_id?: number;
  is_graded?: 0 | 1;
};

// ⬅️ ganti fungsi lama ini
function toQuery(params: ParticipantHistoryFilters = {}): string {
  const q = new URLSearchParams();

  if (typeof params.paginate === "number") {
    q.set("paginate", String(params.paginate));
  }
  if (typeof params.page === "number") {
    q.set("page", String(params.page));
  }
  if (typeof params.search === "string") {
    // boleh kosong, backend kamu memang terima "search="
    q.set("search", params.search.trim());
  }
  if (typeof params.user_id === "number") {
    q.set("user_id", String(params.user_id));
  }
  if (typeof params.test_id === "number") {
    q.set("test_id", String(params.test_id));
  }
  if (typeof params.start_date === "string") {
    q.set("start_date", params.start_date);
  }
  if (typeof params.end_date === "string") {
    q.set("end_date", params.end_date);
  }
  if (typeof params.is_ongoing === "number") {
    q.set("is_ongoing", String(params.is_ongoing));
  }
  if (typeof params.is_completed === "number") {
    q.set("is_completed", String(params.is_completed));
  }
  if (typeof params.orderBy === "string") {
    q.set("orderBy", params.orderBy);
  }
  if (typeof params.searchBySpecific === "string") {
    q.set("searchBySpecific", params.searchBySpecific);
  }

  return q.toString();
}


export const tryoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── HISTORY (LIST + DETAIL) ──────────────────────────────────────────────
    getParticipantHistoryList: builder.query<
      {
        data: ParticipantHistoryItem[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      ParticipantHistoryFilters | void
    >({
      query: (filters) => {
        // 1. ambil filters dari komponen
        const incoming: ParticipantHistoryFilters = filters ?? {};

        // 2. kasih default (tapi YANG SUDAH DIKIRIM jangan ditimpa)
        const merged: ParticipantHistoryFilters = {
          page: 1,
          paginate: 10,
          orderBy: "grade",
          ...incoming,
        };

        // 3. auto mode: kalau test_id dikirim tapi search/searchBySpecific kosong,
        //    ikuti pola backend kamu: searchBySpecific=test_id & search=<id>
        if (
          typeof merged.test_id === "number" &&
          !merged.searchBySpecific &&
          (merged.search === undefined || merged.search === "")
        ) {
          merged.searchBySpecific = "test_id";
          merged.search = String(merged.test_id);
        }

        const qs = toQuery(merged);

        return {
          url: `/participant/history-test?${qs}`,
          method: "GET",
        };
      },
      transformResponse: (res: PaginatedResponse<ParticipantHistoryItem>) => ({
        data: res.data.data,
        last_page: res.data.last_page,
        current_page: res.data.current_page,
        total: res.data.total,
        per_page: res.data.per_page,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((i) => ({
                type: "ParticipantHistory" as const,
                id: i.id,
              })),
              { type: "ParticipantHistory" as const, id: "LIST" },
            ]
          : [{ type: "ParticipantHistory" as const, id: "LIST" }],
    }),

    getParticipantHistoryById: builder.query<ParticipantHistoryItem, number>({
      query: (id) => ({
        url: `/participant/history-test/${id}`,
        method: "GET",
      }),
      transformResponse: (res: ItemResponse<ParticipantHistoryItem>) =>
        res.data,
      providesTags: (_res, _err, id) => [{ type: "ParticipantHistory", id }],
    }),
    

    getParticipantHistoryByIdEssay: builder.query<
      {
        data: ParticipantHistoryItem[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { participant_test_id: number; test_id: number; is_graded?: 0 | 1 }
    >({
      query: ({ participant_test_id, test_id, is_graded = 0 }) => {
        const qs = toQuery({
          paginate: 10,
          searchBySpecific: "participant_test_id",
          search: String(participant_test_id),
          page: 1,
          test_id,
          is_graded,
        });
        return {
          url: `/participant/essay-answers?${qs}`,
          method: "GET",
        };
      },
      transformResponse: (res: PaginatedResponse<ParticipantHistoryItem>) => ({
        data: res.data.data,
        last_page: res.data.last_page,
        current_page: res.data.current_page,
        total: res.data.total,
        per_page: res.data.per_page,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((i) => ({
                type: "ParticipantHistory" as const,
                id: i.id,
              })),
              { type: "ParticipantHistory" as const, id: "LIST" },
            ]
          : [{ type: "ParticipantHistory" as const, id: "LIST" }],
    }),

    gradeEssay: builder.mutation<
      ParticipantTest,
      { id: number; point: number; is_graded: 0 | 1 }
    >({
      query: ({ id, point, is_graded }) => ({
        url: `/participant/essay-answers/${id}`,
        method: "PUT",
        body: { point, is_graded },
      }),
      transformResponse: (res: GenerateTestResponse) => res.data,
      invalidatesTags: [{ type: "ParticipantHistory", id: "LIST" }],
    }),

    // ── GENERATE TEST ────────────────────────────────────────────────────────
    generateTest: builder.mutation<ParticipantTest, GenerateTestPayload>({
      query: (payload) => ({
        url: `/participant/generate-test`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (res: GenerateTestResponse) => res.data,
      invalidatesTags: [{ type: "ParticipantHistory", id: "LIST" }],
    }),

    // ── CONTINUE (PER TEST) ──────────────────────────────────────────────────
    continueTest: builder.mutation<ContinueTestData, number>({
      query: (participantTestId) => ({
        url: `/participant/continue/${participantTestId}`,
        method: "PUT",
      }),
      transformResponse: (res: ContinueTestResponse) => res.data,
      invalidatesTags: (_res, _err, id) => [
        { type: "ParticipantHistory", id },
        { type: "ParticipantSession", id },
      ],
    }),

    regenerateTest: builder.mutation<ContinueTestData, number>({
      query: (participantTestId) => ({
        url: `/participant/regenerate-test/${participantTestId}`,
        method: "PUT",
      }),
      transformResponse: (res: ContinueTestResponse) => res.data,
      invalidatesTags: (_res, _err, id) => [
        { type: "ParticipantHistory", id },
        { type: "ParticipantSession", id },
      ],
    }),

    // ── ACTIVE CATEGORY (GET) ────────────────────────────────────────────────
    getActiveCategory: builder.query<
      ParticipantQuestionCategory | null,
      number
    >({
      query: (participantTestId) => ({
        url: `/participant/active-category/${participantTestId}`,
        method: "GET",
      }),
      transformResponse: (res: ActiveCategoryResponse) =>
        "data" in res ? res.data : null,
      providesTags: (_res, _err, id) => [{ type: "ParticipantSession", id }],
    }),

    // ── CONTINUE KE CATEGORY TERTENTU ────────────────────────────────────────
    continueCategory: builder.mutation<
      ContinueTestData,
      { participant_test_id: number; participant_category_id: number }
    >({
      query: ({ participant_test_id, participant_category_id }) => ({
        url: `/participant/continue/${participant_test_id}/${participant_category_id}`,
        method: "PUT",
      }),
      transformResponse: (res: ContinueTestResponse) => res.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "ParticipantSession", id: arg.participant_test_id },
        { type: "ParticipantHistory", id: arg.participant_test_id },
      ],
    }),

    // ── END CATEGORY ─────────────────────────────────────────────────────────
    endCategory: builder.mutation<
      EndCategoryData,
      { participant_test_id: number; participant_category_id: number }
    >({
      query: ({ participant_test_id, participant_category_id }) => ({
        url: `/participant/end-category/${participant_test_id}/${participant_category_id}`,
        method: "PUT",
      }),
      transformResponse: (res: EndCategoryResponse) => res.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "ParticipantSession", id: arg.participant_test_id },
        { type: "ParticipantHistory", id: arg.participant_test_id },
      ],
    }),

    // ── END SESSION ──────────────────────────────────────────────────────────
    endSession: builder.mutation<ParticipantTest, number>({
      query: (participant_test_id) => ({
        url: `/participant/end-session/${participant_test_id}`,
        method: "PUT",
      }),
      transformResponse: (res: EndSessionResponse) => res.data,
      invalidatesTags: (_res, _err, id) => [
        { type: "ParticipantSession", id },
        { type: "ParticipantHistory", id },
        { type: "ParticipantHistory", id: "LIST" },
      ],
    }),

    deleteParticipant: builder.mutation<ParticipantTest, number>({
      query: (participant_test_id) => ({
        url: `/participant/history-test/${participant_test_id}`,
        method: "DELETE",
      }),
      transformResponse: (res: EndSessionResponse) => res.data,
    }),

    // ── ANSWERS: SAVE / RESET / FLAG ─────────────────────────────────────────
    saveAnswer: builder.mutation<
      AnswerResponse["data"],
      { participant_test_id: number; payload: SaveAnswerPayload }
    >({
      query: ({ participant_test_id, payload }) => ({
        url: `/participant/save-answer/${participant_test_id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (res: AnswerResponse) => res.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "ParticipantSession", id: arg.participant_test_id },
        { type: "ParticipantAnswer", id: arg.payload.question_id },
      ],
    }),

    resetAnswer: builder.mutation<
      AnswerResponse["data"],
      { participant_test_id: number; payload: ResetAnswerPayload }
    >({
      query: ({ participant_test_id, payload }) => ({
        url: `/participant/reset-answer/${participant_test_id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (res: AnswerResponse) => res.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "ParticipantSession", id: arg.participant_test_id },
        { type: "ParticipantAnswer", id: arg.payload.question_id },
      ],
    }),

    flagQuestion: builder.mutation<
      AnswerResponse["data"],
      { participant_test_id: number; payload: FlagQuestionPayload }
    >({
      query: ({ participant_test_id, payload }) => ({
        url: `/participant/flag-question/${participant_test_id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (res: AnswerResponse) => res.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "ParticipantSession", id: arg.participant_test_id },
        { type: "ParticipantAnswer", id: arg.payload.question_id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  // history
  useGetParticipantHistoryListQuery,
  useGetParticipantHistoryByIdQuery,
  useGetParticipantHistoryByIdEssayQuery,
  useGradeEssayMutation,
  // generator & session
  useGenerateTestMutation,
  useContinueTestMutation,
  useRegenerateTestMutation,
  useGetActiveCategoryQuery,
  useContinueCategoryMutation,
  useEndCategoryMutation,
  useEndSessionMutation,
  useDeleteParticipantMutation,
  // answers
  useSaveAnswerMutation,
  useResetAnswerMutation,
  useFlagQuestionMutation,
} = tryoutApi;
