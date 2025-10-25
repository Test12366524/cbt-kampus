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
  page?: number; // default 1
  paginate?: number; // default 10
  search?: string; // boleh string kosong "" untuk kasus searchBySpecific
  user_id?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  is_ongoing?: 0 | 1; // 1 = true
  is_completed?: 0 | 1; // 1 = true

  // NEW
  orderBy?: string; // contoh: "grade"
  searchBySpecific?: string; // contoh: "test_id"
  test_id?: number; // shortcut → searchBySpecific=test_id & search=<id>
};

function toQuery(params: ParticipantHistoryFilters = {}) {
  const q = new URLSearchParams();
  if (params.paginate != null) q.set("paginate", String(params.paginate));
  // set juga jika string kosong, agar bisa menghasilkan "search="
  if (params.search != null) q.set("search", params.search.trim());
  if (params.page != null) q.set("page", String(params.page));
  if (params.user_id != null) q.set("user_id", String(params.user_id));
  if (params.start_date) q.set("start_date", params.start_date);
  if (params.end_date) q.set("end_date", params.end_date);
  if (params.is_ongoing != null) q.set("is_ongoing", String(params.is_ongoing));
  if (params.is_completed != null)
    q.set("is_completed", String(params.is_completed));

  // NEW
  if (params.orderBy) q.set("orderBy", params.orderBy);
  if (params.searchBySpecific)
    q.set("searchBySpecific", params.searchBySpecific);

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
        // Normalisasi: jika test_id dipakai dan search belum diisi,
        // set otomatis searchBySpecific=test_id dan search=<test_id>
        const f = filters ?? {};
        const normalized: ParticipantHistoryFilters = { ...f };

        if (
          typeof f.test_id === "number" &&
          (f.search == null || f.search === "")
        ) {
          normalized.searchBySpecific = f.searchBySpecific ?? "test_id";
          normalized.search = String(f.test_id);
        }

        // Default yang diminta: page=1, paginate=10, orderBy=grade
        const qs = toQuery({
          page: 1,
          paginate: 10,
          orderBy: "grade",
          ...normalized,
        });

        return { url: `/participant/history-test?${qs}`, method: "GET" };
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
  // generator & session
  useGenerateTestMutation,
  useContinueTestMutation,
  useGetActiveCategoryQuery,
  useContinueCategoryMutation,
  useEndCategoryMutation,
  useEndSessionMutation,
  // answers
  useSaveAnswerMutation,
  useResetAnswerMutation,
  useFlagQuestionMutation,
} = tryoutApi;