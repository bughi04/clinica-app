--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-05-30 20:38:23

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

DROP DATABASE IF EXISTS postgres;
--
-- TOC entry 5038 (class 1262 OID 5)
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United Kingdom.1252';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

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
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 5038
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- TOC entry 7 (class 2615 OID 16388)
-- Name: pgagent; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA pgagent;


ALTER SCHEMA pgagent OWNER TO postgres;

--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA pgagent; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA pgagent IS 'pgAgent system tables';


--
-- TOC entry 2 (class 3079 OID 16389)
-- Name: pgagent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgagent WITH SCHEMA pgagent;


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgagent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgagent IS 'A PostgreSQL job scheduler';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 243 (class 1259 OID 16596)
-- Name: boli; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boli (
    idboala integer NOT NULL,
    pacientid integer NOT NULL,
    boli_inima boolean,
    purtator_proteza boolean,
    diabet boolean,
    hepatita boolean,
    reumatism boolean,
    boli_respiratorii boolean,
    tulburari_coagulare_sange boolean,
    anemie boolean,
    boli_rinichi boolean,
    glaucom boolean,
    epilepsie boolean,
    migrene boolean,
    osteoporoza boolean,
    ulcer_gastric boolean,
    boli_tiroida boolean,
    boli_neurologice boolean,
    probleme_psihice boolean,
    alte_boli text
);


ALTER TABLE public.boli OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16595)
-- Name: boli_idboala_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.boli_idboala_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.boli_idboala_seq OWNER TO postgres;

--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 242
-- Name: boli_idboala_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.boli_idboala_seq OWNED BY public.boli.idboala;


--
-- TOC entry 245 (class 1259 OID 16610)
-- Name: date_antecedente_medicale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.date_antecedente_medicale (
    idantecedent integer NOT NULL,
    pacientid integer NOT NULL,
    nota_stare_sanatate text,
    ingrijire_alt_medic boolean,
    spitalizare text,
    medicamente text,
    fumat boolean,
    alergii text,
    antidepresive boolean,
    femeie_insarcinata_luna character varying(20),
    femeie_bebe_alaptare boolean,
    data date NOT NULL
);


ALTER TABLE public.date_antecedente_medicale OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16609)
-- Name: date_antecedente_medicale_idantecedent_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.date_antecedente_medicale_idantecedent_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.date_antecedente_medicale_idantecedent_seq OWNER TO postgres;

--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 244
-- Name: date_antecedente_medicale_idantecedent_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.date_antecedente_medicale_idantecedent_seq OWNED BY public.date_antecedente_medicale.idantecedent;


--
-- TOC entry 241 (class 1259 OID 16580)
-- Name: datestomatologice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.datestomatologice (
    datemedicaleid integer NOT NULL,
    pacientid integer NOT NULL,
    sanatategingii text,
    sensibilitatedinti boolean NOT NULL,
    problemetratamentortodontic text,
    scrasnit_inclestat_scrasnit_dinti boolean NOT NULL,
    ultim_consult_stomatologic date,
    nota_aspect_dentatie integer,
    probleme_tratament_stomatologic_anterior text,
    data date NOT NULL,
    CONSTRAINT datestomatologice_nota_aspect_dentatie_check CHECK (((nota_aspect_dentatie >= 1) AND (nota_aspect_dentatie <= 10)))
);


ALTER TABLE public.datestomatologice OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16579)
-- Name: datestomatologice_datemedicaleid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.datestomatologice_datemedicaleid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.datestomatologice_datemedicaleid_seq OWNER TO postgres;

--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 240
-- Name: datestomatologice_datemedicaleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.datestomatologice_datemedicaleid_seq OWNED BY public.datestomatologice.datemedicaleid;


--
-- TOC entry 251 (class 1259 OID 16641)
-- Name: dentisti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dentisti (
    dentistid integer NOT NULL,
    firstname character varying(100) NOT NULL,
    lastname character varying(100) NOT NULL
);


ALTER TABLE public.dentisti OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16640)
-- Name: dentisti_dentistid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dentisti_dentistid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dentisti_dentistid_seq OWNER TO postgres;

--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 250
-- Name: dentisti_dentistid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dentisti_dentistid_seq OWNED BY public.dentisti.dentistid;


--
-- TOC entry 239 (class 1259 OID 16564)
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    pacientid integer NOT NULL,
    firstname character varying(100) NOT NULL,
    surname character varying(100) NOT NULL,
    cnp character varying(20) NOT NULL,
    birthdate date NOT NULL,
    email character varying(150) NOT NULL,
    telefon character varying(20) NOT NULL,
    address text NOT NULL,
    recomandare text,
    nume_representant character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16563)
-- Name: patients_pacientid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_pacientid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_pacientid_seq OWNER TO postgres;

--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 238
-- Name: patients_pacientid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_pacientid_seq OWNED BY public.patients.pacientid;


--
-- TOC entry 249 (class 1259 OID 16634)
-- Name: tutori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutori (
    tutoreid integer NOT NULL,
    tutore_first_name character varying(100) NOT NULL,
    tutore_last_name character varying(100) NOT NULL
);


ALTER TABLE public.tutori OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16633)
-- Name: tutori_tutoreid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tutori_tutoreid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tutori_tutoreid_seq OWNER TO postgres;

--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 248
-- Name: tutori_tutoreid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tutori_tutoreid_seq OWNED BY public.tutori.tutoreid;


--
-- TOC entry 247 (class 1259 OID 16624)
-- Name: useri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.useri (
    userid integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    type character varying(10) NOT NULL,
    data_inscriere date NOT NULL,
    CONSTRAINT useri_type_check CHECK (((type)::text = ANY ((ARRAY['pacient'::character varying, 'dentist'::character varying])::text[])))
);


ALTER TABLE public.useri OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16623)
-- Name: useri_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.useri_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.useri_userid_seq OWNER TO postgres;

--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 246
-- Name: useri_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.useri_userid_seq OWNED BY public.useri.userid;


--
-- TOC entry 4810 (class 2604 OID 16599)
-- Name: boli idboala; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boli ALTER COLUMN idboala SET DEFAULT nextval('public.boli_idboala_seq'::regclass);


--
-- TOC entry 4811 (class 2604 OID 16613)
-- Name: date_antecedente_medicale idantecedent; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.date_antecedente_medicale ALTER COLUMN idantecedent SET DEFAULT nextval('public.date_antecedente_medicale_idantecedent_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 16583)
-- Name: datestomatologice datemedicaleid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datestomatologice ALTER COLUMN datemedicaleid SET DEFAULT nextval('public.datestomatologice_datemedicaleid_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 16644)
-- Name: dentisti dentistid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dentisti ALTER COLUMN dentistid SET DEFAULT nextval('public.dentisti_dentistid_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 16567)
-- Name: patients pacientid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN pacientid SET DEFAULT nextval('public.patients_pacientid_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 16637)
-- Name: tutori tutoreid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutori ALTER COLUMN tutoreid SET DEFAULT nextval('public.tutori_tutoreid_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 16627)
-- Name: useri userid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.useri ALTER COLUMN userid SET DEFAULT nextval('public.useri_userid_seq'::regclass);


--
-- TOC entry 4768 (class 0 OID 16390)
-- Dependencies: 223
-- Data for Name: pga_jobagent; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

INSERT INTO pgagent.pga_jobagent VALUES (12408, '2025-05-29 21:53:38.545455+03', 'Helen-NB');


--
-- TOC entry 4769 (class 0 OID 16399)
-- Dependencies: 225
-- Data for Name: pga_jobclass; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--



--
-- TOC entry 4770 (class 0 OID 16409)
-- Dependencies: 227
-- Data for Name: pga_job; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--



--
-- TOC entry 4772 (class 0 OID 16457)
-- Dependencies: 231
-- Data for Name: pga_schedule; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--



--
-- TOC entry 4773 (class 0 OID 16485)
-- Dependencies: 233
-- Data for Name: pga_exception; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--



--
-- TOC entry 4774 (class 0 OID 16499)
-- Dependencies: 235
-- Data for Name: pga_joblog; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--



--
-- TOC entry 4771 (class 0 OID 16433)
-- Dependencies: 229
-- Data for Name: pga_jobstep; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--



--
-- TOC entry 4775 (class 0 OID 16515)
-- Dependencies: 237
-- Data for Name: pga_jobsteplog; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--



--
-- TOC entry 5024 (class 0 OID 16596)
-- Dependencies: 243
-- Data for Name: boli; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5026 (class 0 OID 16610)
-- Dependencies: 245
-- Data for Name: date_antecedente_medicale; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5022 (class 0 OID 16580)
-- Dependencies: 241
-- Data for Name: datestomatologice; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.datestomatologice VALUES (1, 1, 'Inflamed', true, NULL, false, NULL, 8, NULL, '2025-05-30');


--
-- TOC entry 5032 (class 0 OID 16641)
-- Dependencies: 251
-- Data for Name: dentisti; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5020 (class 0 OID 16564)
-- Dependencies: 239
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.patients VALUES (1, 'Ion', 'Pop', '1234567890123', '1985-04-02', 'ion.new@example.com', '0721234567', 'Strada Mare 10', NULL, NULL, '2025-05-30 17:10:23.577179', '2025-05-30 17:10:23.577179');


--
-- TOC entry 5030 (class 0 OID 16634)
-- Dependencies: 249
-- Data for Name: tutori; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5028 (class 0 OID 16624)
-- Dependencies: 247
-- Data for Name: useri; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 242
-- Name: boli_idboala_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.boli_idboala_seq', 1, false);


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 244
-- Name: date_antecedente_medicale_idantecedent_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.date_antecedente_medicale_idantecedent_seq', 1, false);


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 240
-- Name: datestomatologice_datemedicaleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.datestomatologice_datemedicaleid_seq', 1, true);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 250
-- Name: dentisti_dentistid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dentisti_dentistid_seq', 1, false);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 238
-- Name: patients_pacientid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_pacientid_seq', 1, true);


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 248
-- Name: tutori_tutoreid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tutori_tutoreid_seq', 1, false);


--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 246
-- Name: useri_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.useri_userid_seq', 1, false);


--
-- TOC entry 4860 (class 2606 OID 16603)
-- Name: boli boli_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boli
    ADD CONSTRAINT boli_pkey PRIMARY KEY (idboala);


--
-- TOC entry 4862 (class 2606 OID 16617)
-- Name: date_antecedente_medicale date_antecedente_medicale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.date_antecedente_medicale
    ADD CONSTRAINT date_antecedente_medicale_pkey PRIMARY KEY (idantecedent);


--
-- TOC entry 4858 (class 2606 OID 16588)
-- Name: datestomatologice datestomatologice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datestomatologice
    ADD CONSTRAINT datestomatologice_pkey PRIMARY KEY (datemedicaleid);


--
-- TOC entry 4870 (class 2606 OID 16646)
-- Name: dentisti dentisti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dentisti
    ADD CONSTRAINT dentisti_pkey PRIMARY KEY (dentistid);


--
-- TOC entry 4852 (class 2606 OID 16575)
-- Name: patients patients_cnp_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_cnp_key UNIQUE (cnp);


--
-- TOC entry 4854 (class 2606 OID 16577)
-- Name: patients patients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_key UNIQUE (email);


--
-- TOC entry 4856 (class 2606 OID 16573)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (pacientid);


--
-- TOC entry 4868 (class 2606 OID 16639)
-- Name: tutori tutori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutori
    ADD CONSTRAINT tutori_pkey PRIMARY KEY (tutoreid);


--
-- TOC entry 4864 (class 2606 OID 16630)
-- Name: useri useri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.useri
    ADD CONSTRAINT useri_pkey PRIMARY KEY (userid);


--
-- TOC entry 4866 (class 2606 OID 16632)
-- Name: useri useri_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.useri
    ADD CONSTRAINT useri_username_key UNIQUE (username);


--
-- TOC entry 4873 (class 2606 OID 16618)
-- Name: date_antecedente_medicale fk_antecedente_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.date_antecedente_medicale
    ADD CONSTRAINT fk_antecedente_patient FOREIGN KEY (pacientid) REFERENCES public.patients(pacientid) ON DELETE CASCADE;


--
-- TOC entry 4872 (class 2606 OID 16604)
-- Name: boli fk_boli_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boli
    ADD CONSTRAINT fk_boli_patient FOREIGN KEY (pacientid) REFERENCES public.patients(pacientid) ON DELETE CASCADE;


--
-- TOC entry 4871 (class 2606 OID 16589)
-- Name: datestomatologice fk_pacient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datestomatologice
    ADD CONSTRAINT fk_pacient FOREIGN KEY (pacientid) REFERENCES public.patients(pacientid) ON DELETE CASCADE;


-- Completed on 2025-05-30 20:38:23

--
-- PostgreSQL database dump complete
--

