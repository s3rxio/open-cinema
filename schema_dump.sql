--
-- PostgreSQL database dump
--

\restrict CaiplQmmPVj2xfbG2VZ8zKPMmorKdPCA9ha2MywGc1eLuIQ76Dckf1AtT4f3d7R

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: audio_metas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audio_metas (
    id text NOT NULL,
    slug text NOT NULL,
    display_name text NOT NULL,
    url text NOT NULL,
    "orderNumer" integer NOT NULL,
    "streamId" text NOT NULL,
    bitrate integer NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isProcessed" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.audio_metas OWNER TO postgres;

--
-- Name: episodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.episodes (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    release_date timestamp(3) without time zone NOT NULL,
    rating double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    season integer NOT NULL,
    series_id text NOT NULL,
    episode integer NOT NULL,
    "streamId" text
);


ALTER TABLE public.episodes OWNER TO postgres;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id text NOT NULL,
    user_id text NOT NULL,
    movie_id text NOT NULL,
    series_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: movies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movies (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    release_date timestamp(3) without time zone NOT NULL,
    genre text NOT NULL,
    director text NOT NULL,
    rating double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    "streamId" text
);


ALTER TABLE public.movies OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    content text NOT NULL,
    rating double precision NOT NULL,
    user_id text NOT NULL,
    movie_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: series; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.series (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    release_date timestamp(3) without time zone NOT NULL,
    genre text NOT NULL,
    director text NOT NULL,
    rating double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.series OWNER TO postgres;

--
-- Name: streams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streams (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.streams OWNER TO postgres;

--
-- Name: subtitle_metas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtitle_metas (
    id text NOT NULL,
    slug text NOT NULL,
    display_name text NOT NULL,
    url text NOT NULL,
    "orderNumer" integer NOT NULL,
    "streamId" text NOT NULL,
    "isProcessed" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.subtitle_metas OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    refresh_token text,
    birthdate timestamp(3) without time zone,
    gender public."Gender" DEFAULT 'OTHER'::public."Gender",
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: video_metas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video_metas (
    id text NOT NULL,
    slug text NOT NULL,
    display_name text NOT NULL,
    url text NOT NULL,
    "streamId" text NOT NULL,
    bitrate integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    "isProcessed" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.video_metas OWNER TO postgres;

--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audio_metas audio_metas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audio_metas
    ADD CONSTRAINT audio_metas_pkey PRIMARY KEY (id);


--
-- Name: episodes episodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: series series_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series
    ADD CONSTRAINT series_pkey PRIMARY KEY (id);


--
-- Name: streams streams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_pkey PRIMARY KEY (id);


--
-- Name: subtitle_metas subtitle_metas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtitle_metas
    ADD CONSTRAINT subtitle_metas_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_metas video_metas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_metas
    ADD CONSTRAINT video_metas_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: audio_metas audio_metas_streamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audio_metas
    ADD CONSTRAINT "audio_metas_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES public.streams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: episodes episodes_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.series(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: episodes episodes_streamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT "episodes_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES public.streams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: favorites favorites_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: favorites favorites_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.series(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: movies movies_streamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT "movies_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES public.streams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subtitle_metas subtitle_metas_streamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtitle_metas
    ADD CONSTRAINT "subtitle_metas_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES public.streams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: video_metas video_metas_streamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_metas
    ADD CONSTRAINT "video_metas_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES public.streams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict CaiplQmmPVj2xfbG2VZ8zKPMmorKdPCA9ha2MywGc1eLuIQ76Dckf1AtT4f3d7R

