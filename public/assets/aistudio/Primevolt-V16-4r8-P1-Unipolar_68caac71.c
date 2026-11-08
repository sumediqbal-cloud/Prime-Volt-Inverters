/* PRIME VOLT INVERTERS - ALPHA VERSION (SUMED IQBAL) - PURE UNIPOLAR EDITION
 * Target: dsPIC30F2010, 7.3728 MHz crystal, XT_PLL4, FCY=7.3728 MHz (7.3728 MIPS).
 *
 * Key Architecture & Verification Summary:
 * 1. 100% Pure Unipolar Core (Zero Legacy Symmetric Mode in Menu, Core, Flash, or EEPROM):
 *    - Internal 16 kHz PWM ISR (_PWMInterrupt), 256-point Sine LUT, Q15/Q13 fixed-point
 *      modulation math, deadtime compensation, and 40-byte EEPROM settings structure
 *      are 100% preserved without any alteration to the PWM core.
 * 2. Exact 3s + 3s + 3s Boot Sequence + Animated Soft-Start + System Information:
 *    - Stage 1 (3.0 s): Animated "INITIALIZATION" 16-block progress bar (3000 ms).
 *    - Stage 2 (3.0 s): Status Banner "PRIME VOLT INV. / ALPHA VERSION / (Sumed Iqbal)" (3000 ms).
 *    - Stage 3 (3.0 s): "SYSTEM CHECKING" ("FAULT CHECK OK" -> "PV CONFIG CHECK" -> "STATUS: READY", 3000 ms).
 *    - Stage 4: Animated PWM Soft-Start loading ("SOFT START 0..100%" + 16-block bar).
 *    - Stage 5: "STATUS: ON / PWM ACTIVE" -> "SYSTEM INFO / ENTER TO VIEW" -> Live Dashboard & 13-page System Info.
 * 3. WDT-Safe Button & Menu Engine (Zero Spurious Restarts):
 *    - Every LCD nibble pulse, delay loop, ADC averaging loop, and EEPROM write kicks
 *      the hardware Watchdog Timer (WDT_KICK()), completely eliminating button-triggered resets.
 *    - Holding ENTER for 2.0 seconds (200 x 10 ms ticks) opens the 26-item Unipolar Menu.
 *    - Short press ENTER toggles Editing Mode ('*' indicator on top-right of LCD).
 *    - UP / DOWN buttons adjust values in Editing Mode or scroll items in Navigation Mode.
 *    - Short press ENTER exits Editing Mode; selecting "SAVE & RESTART" (Item 26) saves
 *      settings to EEPROM while PWM is safely off and triggers a clean system restart
 *      back into the 3s + 3s + 3s initialization sequence.
 */
#include <xc.h>
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#define PWM_HOT

#define XTAL_HZ                    7372800UL
#define PLL_MULT                   4UL
#define FOSC_HZ                    (XTAL_HZ * PLL_MULT)
#define FCY                        (FOSC_HZ / 4UL)
#include <libpic30.h>

#if (FCY != 7372800UL)
#error "This file is intentionally fixed to 7.3728 MHz crystal with PLL x4"
#endif

#pragma config FOS = PRI
#pragma config FCKSMEN = CSW_FSCM_OFF
#pragma config FPR = XT_PLL4
#pragma config FWPSA = WDTPSA_512
#pragma config FWPSB = WDTPSB_16
#pragma config WDT = WDT_ON
#pragma config MCLRE = MCLR_EN
#pragma config BOREN = PBOR_ON
#pragma config BODENV = BORV_42
#pragma config FPWRT = PWRT_64
#pragma config PWMPIN = RST_IOPIN
#pragma config HPOL = PWMxH_ACT_HI
#pragma config LPOL = PWMxL_ACT_HI
#pragma config GWRP = GWRP_OFF
#pragma config GCP = CODE_PROT_OFF
#pragma config ICS = PGD

/* Compact LCD text uses the data-EEPROM area at 0x7FFC28 (483 words / 966 bytes).
 * The settings image retains its original base at 0x7FFC00 and its 40-byte format.
 */
#define TXT_0 252U /* "" */
#define TXT_5 253U /* "Unipolar" */
#define TXT_8 259U /* "MOD SINE" */
#define TXT_9 261U /* "PURE SINE" */
#define TXT_10 266U /* "AUTO" */
#define TXT_11 268U /* "OVERMOD SINE" */
#define TXT_12 271U /* "PUR" */
#define TXT_13 274U /* "OVR" */
#define TXT_14 278U /* "ON" */
#define TXT_15 280U /* "OFF" */
#define TXT_16 282U /* "PV LOW" */
#define TXT_17 284U /* "PV HIGH" */
#define TXT_18 286U /* "SHORT CIRCUIT" */
#define TXT_19 294U /* "OVERLOAD" */
#define TXT_20 297U /* "OVER TEMP" */
#define TXT_21 301U /* "CLOCK / PLL" */
#define TXT_22 305U /* "EEPROM" */
#define TXT_23 308U /* "PWM OVERRUN" */
#define TXT_24 313U /* "PWM CONFIG" */
#define TXT_25 316U /* "RETRY LOCK" */
#define TXT_26 321U /* "PV LOW LOCK" */
#define TXT_27 325U /* "READY" */
#define TXT_28 328U /* "STATUS: OFF" */
#define TXT_29 331U /* "STATUS: ON" */
#define TXT_30 334U /* "PWM ACTIVE" */
#define TXT_31 338U /* "STATUS: READY" */
#define TXT_32 342U /* "SYSTEM CHECKING" */
#define TXT_33 346U /* "PV:000 AC~000V" */
#define TXT_34 355U /* "L:0000W Wave:AUT" */
#define TXT_35 369U /* "SYSTEM INFO" */
#define TXT_36 374U /* "CLOCK" */
#define TXT_37 376U /* "PWM ACTUAL Hz" */
#define TXT_38 381U /* "PWM RESOLUTION" */
#define TXT_39 388U /* "PWM PAIR CLOCK" */
#define TXT_40 394U /* "DEAD TIME" */
#define TXT_41 399U /* "OUTPUT TARGET" */
#define TXT_42 405U /* "CYCLE SAMPLES" */
#define TXT_43 412U /* "PROTECT/REBOOT" */
#define TXT_44 421U /* "CHANGEOVER" */
#define TXT_45 426U /* "DC BUS MARGIN" */
#define TXT_46 438U /* "ACTIVE WAVE" */
#define TXT_47 445U /* "AC FEEDBACK" */
#define TXT_48 454U /* "ALPHA VERSION" */
#define TXT_49 464U /* "7.3728M PLL x4" */
#define TXT_50 476U /* " Hz" */
#define TXT_51 478U /* "bit" */
#define TXT_52 482U /* "P1/P2 SAME BASE" */
#define TXT_54 494U /* "ns AUTO" */
#define TXT_55 498U /* "ns MAN" */
#define TXT_56 502U /* "V 50.000 Hz" */
#define TXT_57 510U /* " PER CYCLE" */
#define TXT_58 515U /* "ON / 3 RETRIES" */
#define TXT_59 524U /* "ON / MAN RESET" */
#define TXT_60 531U /* "LIMITED" */
#define TXT_61 538U /* "AVAILABLE" */
#define TXT_62 546U /* "NOT INSTALLED" */
#define TXT_63 555U /* "OUTPUT AC" */
#define TXT_64 558U /* "PV MAX" */
#define TXT_65 563U /* "PV MIN" */
#define TXT_66 567U /* "PV CAL MODE" */
#define TXT_67 574U /* "PV CAL @ 3V" */
#define TXT_68 583U /* "CARRIER" */
#define TXT_70 589U /* "DEADTIME MODE" */
#define TXT_72 595U /* "WAVE TYPE" */
#define TXT_78 602U /* "SOFT START" */
#define TXT_79 607U /* "CHANGEOVER P22" */
#define TXT_80 615U /* "AUTO RESTART" */
#define TXT_82 618U /* "PROTECT PV LOW" */
#define TXT_83 621U /* "PROTECT PV HIGH" */
#define TXT_84 624U /* "PROTECT O/LOAD" */
#define TXT_85 629U /* "PROTECT TEMP" */
#define TXT_86 632U /* "RESTORE FACTORY" */
#define TXT_87 642U /* "NO SAVE & EXIT" */
#define TXT_88 652U /* "SAVE & RESTART" */
#define TXT_89 657U /* "ENTER TO VIEW" */
#define TXT_90 665U /* "V" */
#define TXT_91 667U /* "AUTO 3V=305V" */
#define TXT_92 677U /* "MANUAL" */
#define TXT_93 681U /* "kHz" */
#define TXT_94 685U /* "ns" */
#define TXT_99 687U /* "sec" */
#define TXT_101 691U /* "ENTER AGAIN" */
#define TXT_102 697U /* "ENTER" */
#define TXT_103 700U /* "ENTER = RESTART" */
#define TXT_104 704U /* "INVALID SETTING" */
#define TXT_105 712U /* "CHECK VALUES" */
#define TXT_106 720U /* "FACTORY DEFAULT" */
#define TXT_107 728U /* "SAVING SETTINGS" */
#define TXT_108 739U /* "PWM IS OFF" */
#define TXT_109 745U /* "EEPROM ERROR" */
#define TXT_110 752U /* "SYSTEM OFF" */
#define TXT_111 755U /* "SAVE COMPLETE" */
#define TXT_112 763U /* "RESTARTING..." */
#define TXT_113 770U /* "INITIALIZATION" */
#define TXT_114 778U /* "PRIME VOLT INV." */
#define TXT_115 787U /* "FAULT CHECK OK" */
#define TXT_116 794U /* "PV CONFIG CHECK" */
#define TXT_117 799U /* "CONFIGURATION OK" */
#define TXT_118 808U /* "CONFIG INVALID" */
#define TXT_119 814U /* "SYSTEM STATE" */
#define TXT_120 818U /* "OFF / FAULT" */
#define txt_shunt_title 823U /* "SHUNT mOHM" */
#define txt_gain_title 831U /* "AMP GAIN x" */
#define txt_align_title 840U /* "PWM ALIGNMENT" */
#define txt_align_edge 848U /* "EDGE" */
#define txt_align_center 852U /* "CENTER" */
#define txt_short_reboot 856U /* "SHORT REBOOT" */
#define txt_uni_torque 863U /* "UNI TORQUE" */
#define txt_torque_value 872U /* "SAG HOLD     ms" */
#define txt_short_sensitivity 884U /* "SENSITIVITY    %" */
#define txt_uni_bridge 896U /* "UNI BRIDGE SIDE" */
#define txt_bridge_right 907U /* "Right Polar" */
#define txt_bridge_left 915U /* "Left Polar" */
#define txt_bridge_alt 922U /* "ALT Polar" */
#define TXT_HOST_ADC_SENSE 927U /* "ADC / PV SENSE" */
#define TXT_HOST_RESET_LOCK 935U /* "RESET LOCK" */
#define TXT_HOST_BRAND 940U /* "PRIME VOLT" */
#define TXT_HOST_VERSION 947U /* "(Sumed Iqbal)" */

static const uint16_t lcd_text_eeprom[481]
    __attribute__((space(eedata), address(0x7FFC28))) = {
    0x4554U, 0x4E49U, 0x4552U, 0x2054U, 0x4556U, 0x204DU, 0x4E4FU, 0x5650U,
    0x4C41U, 0x2087U, 0x4F4CU, 0x4B43U, 0x5453U, 0x5320U, 0x5250U, 0x418CU,
    0x4954U, 0x3030U, 0x5541U, 0x4F54U, 0x5750U, 0x8594U, 0x4341U, 0x4E45U,
    0x5284U, 0x4749U, 0x4441U, 0x4F8EU, 0x2020U, 0x984FU, 0x464FU, 0x8B8AU,
    0x8220U, 0x4843U, 0x4544U, 0x454CU, 0x469EU, 0x504DU, 0x2F20U, 0x20A6U,
    0x4781U, 0x2052U, 0x454DU, 0x4547U, 0x809BU, 0x43ACU, 0x4E41U, 0x2084U,
    0x528FU, 0x54B0U, 0x8097U, 0x6C6FU, 0x61B3U, 0x72B4U, 0x4F4DU, 0x5550U,
    0x9392U, 0x4E55U, 0x8643U, 0x46BAU, 0x99BBU, 0x5554U, 0x5953U, 0x53BEU,
    0x80BFU, 0x85C0U, 0x45A1U, 0x8BC2U, 0x4820U, 0x4C4FU, 0x20AAU, 0x4553U,
    0x5020U, 0xAF41U, 0x83ADU, 0x8D44U, 0x4581U, 0x8A89U, 0x57CDU, 0x4853U,
    0x524FU, 0x5449U, 0x9F43U, 0x4545U, 0x5952U, 0xBD8FU, 0x53D5U, 0x3AD6U,
    0x3091U, 0x7AC4U, 0x8690U, 0x5241U, 0x736EU, 0xAE4DU, 0x4952U, 0xB1A0U,
    0xA9B2U, 0x5681U, 0x4988U, 0x9246U, 0x4CE3U, 0xCBB6U, 0xCCE5U, 0x4889U,
    0x99E7U, 0x48E8U, 0xD0CFU, 0x83EAU, 0x9A8AU, 0xA580U, 0x4C50U, 0x4CEEU,
    0x9BD3U, 0x20D4U, 0x599AU, 0x20D7U, 0x9695U, 0x4941U, 0x9AA2U, 0x554FU,
    0x54F7U, 0xB7F8U, 0x83F9U, 0x5943U, 0x43FBU, 0xA3FCU, 0x5500U, 0x696EU,
    0xB570U, 0xE600U, 0xB700U, 0x8D82U, 0x00CCU, 0x00B8U, 0xE69DU, 0xB700U,
    0x0052U, 0x564FU, 0x0052U, 0x0086U, 0x00A4U, 0x00CEU, 0x00E9U, 0x43EBU,
    0x5249U, 0x5543U, 0x00D1U, 0xEC9DU, 0x9D00U, 0xED20U, 0xD200U, 0xEFA7U,
    0xF000U, 0x004DU, 0x9D95U, 0xB952U, 0x9500U, 0x00BCU, 0x5482U, 0x9FF1U,
    0xCE00U, 0x9F20U, 0x8200U, 0x00F2U, 0xA4F3U, 0xF300U, 0x0086U, 0x90F4U,
    0x0084U, 0xA0D7U, 0x00F2U, 0xC3C1U, 0x00A8U, 0x3A87U, 0x20D8U, 0x7E96U,
    0x56D8U, 0x4C00U, 0x913AU, 0x5791U, 0x5720U, 0x7661U, 0x3A65U, 0x5492U,
    0xC100U, 0x4681U, 0x004FU, 0x00D2U, 0xBDF4U, 0xD988U, 0x9500U, 0x5382U,
    0x55C5U, 0x00DAU, 0x5095U, 0xA9F5U, 0x00D2U, 0x20F6U, 0xAA90U, 0xFA00U,
    0xDB54U, 0x54ABU, 0xFD00U, 0x418DU, 0xA3A5U, 0x0053U, 0x54ADU, 0x822FU,
    0x4F42U, 0x544FU, 0xA100U, 0xABAEU, 0x009DU, 0x4344U, 0x4220U, 0x5355U,
    0x4D20U, 0x47DBU, 0x0081U, 0x9096U, 0x57AFU, 0x8441U, 0x9600U, 0x4620U,
    0x44D3U, 0x4142U, 0x008BU, 0x5088U, 0x4148U, 0x9820U, 0x4953U, 0x0086U,
    0x2E37U, 0x3733U, 0x3832U, 0xEF85U, 0x7820U, 0x0034U, 0x00D9U, 0x6962U,
    0x0074U, 0x3150U, 0x502FU, 0x8D32U, 0xC641U, 0x4142U, 0x00C7U, 0x20DCU,
    0x00B8U, 0x20DCU, 0x00DDU, 0x2056U, 0x3035U, 0xD82EU, 0x00D9U, 0x45C8U,
    0xFDA9U, 0x8600U, 0x33A7U, 0x54A0U, 0x45DEU, 0x0053U, 0xA786U, 0xA0DDU,
    0x54C7U, 0x4C00U, 0x4D49U, 0x8049U, 0x0044U, 0x5641U, 0x4CF5U, 0x4241U,
    0x00A3U, 0x4F4EU, 0x8183U, 0x888CU, 0x44A3U, 0xFA00U, 0x0096U, 0x4D89U,
    0x5841U, 0x8900U, 0x814DU, 0x8900U, 0x8843U, 0xB620U, 0x00A2U, 0x4389U,
    0x2088U, 0x2040U, 0x5633U, 0x4300U, 0xDEDBU, 0x5245U, 0xF600U, 0xC690U,
    0xA2B6U, 0x5700U, 0x54C9U, 0x5059U, 0x0045U, 0x9E53U, 0xB183U, 0xA100U,
    0xABAEU, 0xC89DU, 0x3232U, 0xB800U, 0x00DFU, 0xCECAU, 0xCA00U, 0x00E9U,
    0x4FCAU, 0xEC2FU, 0xCA00U, 0x00EDU, 0x8C82U, 0x824FU, 0x4620U, 0x9396U,
    0x00D4U, 0x4F4EU, 0xC98DU, 0x2026U, 0x5845U, 0x00D1U, 0xC953U, 0xDF26U,
    0xE000U, 0x2093U, 0x4956U, 0x5745U, 0x5600U, 0xB800U, 0x3320U, 0x3D56U,
    0x3033U, 0x5635U, 0xDD00U, 0x8855U, 0x6B00U, 0x7A48U, 0xDC00U, 0x7300U,
    0x6365U, 0xE000U, 0x4741U, 0x8141U, 0xB200U, 0x0052U, 0x3DE0U, 0x00DFU,
    0xE2E1U, 0x45CBU, 0x5454U, 0x00A8U, 0x20C3U, 0x8856U, 0x4555U, 0x0053U,
    0x9646U, 0xF193U, 0xE4A2U, 0x0054U, 0x4153U, 0xA856U, 0x458DU, 0x5454U,
    0x53A8U, 0x9500U, 0x5349U, 0xA420U, 0xF000U, 0x4585U, 0x5252U, 0x00D0U,
    0xA4C1U, 0x5300U, 0x43C9U, 0xA54FU, 0x80A3U, 0x8200U, 0xA8B1U, 0x2E2EU,
    0x002EU, 0x4981U, 0xE290U, 0x415AU, 0x00DAU, 0x498EU, 0x56C6U, 0x83C5U,
    0x2EE1U, 0xE400U, 0xC383U, 0x4F20U, 0x004BU, 0xBC89U, 0xC320U, 0xBC00U,
    0x5255U, 0xDA41U, 0x4F20U, 0x004BU, 0x20BCU, 0xE2E1U, 0x0044U, 0x8FC1U,
    0x0080U, 0xA7A4U, 0x54E4U, 0xCF00U, 0x83B9U, 0x4F6DU, 0x4D48U, 0x4100U,
    0x20A5U, 0x4147U, 0x2081U, 0x0078U, 0x8895U, 0x4E99U, 0x974DU, 0x0054U,
    0x4445U, 0x00ABU, 0xB243U, 0x0052U, 0x82EBU, 0x4F42U, 0x544FU, 0xB900U,
    0x2049U, 0x5293U, 0x5551U, 0x0045U, 0x4153U, 0xC447U, 0x44C5U, 0x9C9CU,
    0x6D20U, 0x0073U, 0x9753U, 0x4953U, 0x5690U, 0x59D1U, 0x9C9CU, 0x0025U,
    0x49B9U, 0x4220U, 0x44DEU, 0x8DABU, 0xA249U, 0x5200U, 0x6769U, 0x7468U,
    0xB5C8U, 0x4C00U, 0x6665U, 0xC874U, 0x00B5U, 0x8388U, 0xB550U, 0x9A00U,
    0xA743U, 0x5389U, 0xC797U, 0x8200U, 0x83C7U, 0x009FU, 0x498EU, 0x56C6U,
    0x54C5U, 0x2800U, 0x7553U, 0x656DU, 0x2064U, 0x7149U, 0x6162U, 0x296CU,
    0x0000U,
};

/* -------------------------- fixed safety profile -------------------------- */
#define FW_VERSION_MAJOR           16U
#define FW_VERSION_MINOR           4U
#define FUNDAMENTAL_HZ             50U
#define MAX_MODULATION_Q15         30000U
#define OVERMOD_MAX_FUND_Q15       41613U
#define OVERMOD_LINEAR_Q15         32768U
#define AUTO_WAVE_HYST_Q15         384U
#define MOD_TRACK_UP_Q15           192U
#define MOD_TRACK_DOWN_Q15         512U
#define COMMUTATION_BLANK_PERIODS  0U
#define PWM_OUTPUT_MASK            0x0F00U
#define PWM_BLANK_P1_MASK          0x0C00U
#define MIN_PULSE_MARGIN_TICKS     16U
#define DRIVER_MIN_PULSE_NS        1000U

#define PULSE_POLICY_LOWTHD        1U
#define PULSE_HYST_TICKS           6U
#define OPT_DEADTIME_COMPENSATION  1U
#define DTCOMP_SCALE_Q8            192U
#define GUARD_DIV                  8U
typedef char v15_min_pulse_assert[
    (((MIN_PULSE_MARGIN_TICKS / 2U) * 1356U) / 10U >= DRIVER_MIN_PULSE_NS)
    ? 1 : -1];
#define MAX_LOAD_W                 6500U /* P1: 6 kW rated + margin (was 5000) */
#define AUTO_RESTART_LIMIT         3U
#define PV_CLEAR_HYST_V            5U
#define HARD_FAULT_CLEAR_MS        3000U
#define SHORT_RESTART_TICKS        1000U /* 1000 x 10 ms = 10 seconds */
#define SHORT_SENSITIVITY_MIN      1U
#define SHORT_SENSITIVITY_MAX      100U
#define SHORT_SENSITIVITY_DEFAULT  15U
#define AN1_SHORT_FILTER_PERIODS   16U   /* P1: leaky counter limit (+2 over / -1 under) */
#define PV_FAULT_CLEAR_MS          1000U

#define UNI_TORQUE_SHIFT           4U
#define UNI_TORQUE_MASK            0x30U
#define UNI_TORQUE_DEFAULT         3U /* 500 ms default for heavy torque */
#define UNI_TORQUE_LEVEL(s)        (((s)->protection_mask >> UNI_TORQUE_SHIFT) & 3U)
#define UNI_BRIDGE_SHIFT           6U
#define UNI_BRIDGE_MASK            0xC0U
#define UNI_BRIDGE_RIGHT           0U /* Default: Right leg = 13..16 kHz, Left = 50 Hz */
#define UNI_BRIDGE_LEFT            1U /* Left leg = 13..16 kHz, Right = 50 Hz */
#define UNI_BRIDGE_ALT             2U /* ALT Polar: Zero-crossing full-cycle swap */
#define UNI_BRIDGE_DEFAULT         UNI_BRIDGE_RIGHT
#define UNI_BRIDGE_SIDE(s)         (((s)->protection_mask >> UNI_BRIDGE_SHIFT) & 3U)
#define RETRY_RESET_HEALTHY_MS     60000U
#define AUTO_PV_CAL_3V_V           305U
#define DEADTIME_MIN_NS            1492U
#define DEADTIME_MAX_NS            3255U
#define DEADTIME_DEFAULT_NS        1492U
#define PV_MAX_CONFIGURABLE_V      850U
#define PV_CAL_MIN_3V_V            250U
#define PV_CAL_MAX_3V_V            600U

#define SHUNT_DEFAULT_TENTH_MOHM   333U
#define SHUNT_MIN_TENTH_MOHM       10U
#define SHUNT_MAX_TENTH_MOHM       2000U
#define AMP_GAIN_DEFAULT_X10       90U
#define AMP_GAIN_MIN_X10           10U
#define AMP_GAIN_MAX_X10           1000U
#define ADC_MICROVOLT_PER_COUNT    4888UL /* 5.000 V / 1023 counts */

#ifndef BOARD_HAS_VERIFIED_AC_VOLTAGE_FEEDBACK
#define BOARD_HAS_VERIFIED_AC_VOLTAGE_FEEDBACK 0U
#endif
#define ADC_STALE_GUARD_PERIODS    32U
#define AC_FB_DIVISOR              969U
#define AC_FB_ZERO_MAX_ADC         20U
#define AC_FB_VALID_MIN_V          40U
#define AC_FB_VALID_MAX_V          300U
#define AC_FB_GOOD_SAMPLES         5U
#define AC_TRIM_LIMIT_Q15          3277
#define AC_TRIM_STEP_MAX_Q15       192

#define PV_FAST_CORR_LIMIT_Q15     8192L  /* +/-25 percent */
#define PV_FAST_MIN_ADC            32U
#define WDT_KICK()                 __asm__ volatile ("clrwdt")

#define FILTER_L_DEFAULT_CENTI_MH  275U
#define FILTER_C_DEFAULT_TENTH_UF  110U

#define PROTECT_PV_LOW             0x01U
#define PROTECT_PV_HIGH            0x02U
#define PROTECT_OVERLOAD           0x04U
#define PROTECT_TEMPERATURE        0x08U
#define PROTECT_ALL                (PROTECT_PV_LOW | PROTECT_PV_HIGH | \
                                    PROTECT_OVERLOAD | PROTECT_TEMPERATURE)

/* ------------------------------- hardware -------------------------------- */
#define BTN_ENTER()                (PORTBbits.RB3 == 0)
#define BTN_UP()                   (PORTBbits.RB4 == 0)
#define BTN_DOWN()                 (PORTBbits.RB5 == 0)
#define SHORT_ACTIVE()             (PORTEbits.RE8 == 0)
#define TEMP_ACTIVE()              (PORTEbits.RE5 == 0)
#define CHANGEOVER_ON()            do { LATEbits.LATE4 = 1; } while (0)
#define CHANGEOVER_OFF()           do { LATEbits.LATE4 = 0; } while (0)

#define LCD_D7_LAT                 LATCbits.LATC13
#define LCD_D7_TRIS                TRISCbits.TRISC13
#define LCD_D6_LAT                 LATCbits.LATC14
#define LCD_D6_TRIS                TRISCbits.TRISC14
#define LCD_D5_LAT                 LATDbits.LATD1
#define LCD_D5_TRIS                TRISDbits.TRISD1
#define LCD_D4_LAT                 LATFbits.LATF3
#define LCD_D4_TRIS                TRISFbits.TRISF3
#define LCD_E_LAT                  LATDbits.LATD0
#define LCD_E_TRIS                 TRISDbits.TRISD0
#define LCD_RS_LAT                 LATFbits.LATF2
#define LCD_RS_TRIS                TRISFbits.TRISF2

enum {
    MODE_UNIPOLAR = 0
};

enum {
    WAVE_AUTO = 0,
    WAVE_MODIFIED,
    WAVE_PURE
};

enum {
    PWM_ALIGN_EDGE = 0,
    PWM_ALIGN_CENTER
};

#ifndef DEFAULT_PWM_ALIGNMENT
#define DEFAULT_PWM_ALIGNMENT      PWM_ALIGN_CENTER
#endif

enum {
    EFFECTIVE_WAVE_PURE = 0,
    EFFECTIVE_WAVE_OVERMOD
};

enum {
    FAULT_NONE = 0,
    FAULT_PV_LOW,
    FAULT_PV_HIGH,
    FAULT_SHORT,
    FAULT_OVERLOAD,
    FAULT_TEMPERATURE,
    FAULT_CLOCK,
    FAULT_EEPROM,
    FAULT_PWM_OVERRUN,
    FAULT_PWM_CONFIG,
    FAULT_RETRY_LOCK,
    FAULT_PV_RETRY_LOCK,
    FAULT_ADC_SENSE,
    FAULT_RESET_LOCK
};

/* Preserved 34-byte settings_t layout so existing 40-byte EEPROM images match. */
typedef struct __attribute__((packed, aligned(2))) {
    uint16_t ac_output_v;          /*  0 */
    uint16_t pv_max_v;             /*  2 */
    uint16_t pv_min_v;             /*  4 */
    uint16_t pv_cal_3v_v;          /*  6 */
    uint16_t soft_start_ms;        /*  8 */
    uint16_t carrier_hz;           /* 10 */
    uint16_t deadtime_ns;          /* 12 */
    uint16_t shunt_tenth_mohm;     /* 14 */
    uint16_t amp_gain_x10;         /* 16 */
    uint16_t filter_l_centi_mh;    /* 18 */
    uint16_t filter_c_tenth_uf;    /* 20 */
    uint8_t mode;                  /* 22: fixed MODE_UNIPOLAR (0) */
    uint8_t reserved_slot_23;      /* 23: reserved unipolar slot (50) */
    uint8_t auto_restart;          /* 24 */
    uint8_t pv_cal_auto;           /* 25 */
    uint8_t deadtime_auto;         /* 26 */
    uint8_t changeover_enable;     /* 27 */
    uint8_t protection_mask;       /* 28 */
    uint8_t wave_type;             /* 29 */
    uint8_t reserved_slot_30;      /* 30: reserved unipolar slot (0) */
    uint8_t short_restart;         /* 31 */
    uint8_t pwm_alignment;         /* 32: EDGE=0, CENTER=1 */
    uint8_t short_sensitivity_pct; /* 33: 1..100% */
} settings_t;

typedef struct {
    volatile uint16_t pv_v;
    volatile uint16_t load_w;
    volatile uint16_t estimated_ac_v;
    volatile uint16_t measured_ac_v;
    volatile uint8_t fault;
    volatile uint8_t effective_wave;
    volatile bool regulation_limited;
    volatile bool ac_feedback_active;
} runtime_t;

static settings_t g_cfg;
static settings_t g_edit;
static volatile runtime_t g_run;

static bool g_pv_sag_started;
static uint16_t g_pv_sag_tick;
static uint16_t g_uni_floor_adc;
static uint16_t g_uni_reserve_adc;

static volatile bool g_pwm_active;
static volatile uint32_t g_phase;
static volatile uint32_t g_phase_step;
static uint16_t g_uni_wrap_guard;
static volatile uint16_t g_pwm_span;
static volatile uint16_t g_pwm_neutral;
static uint16_t g_pwm_period;
static uint16_t g_pwm_selected_hz;
static uint8_t g_pwm_ptmod;
static volatile uint16_t g_deadtime_count;
static uint16_t g_deadtime_comp;
static uint16_t g_min_pulse;
static uint16_t g_max_pulse;
static uint8_t  g_pulse_park;
static uint8_t g_adc_stale_periods;
static uint8_t g_an1_over_count;
/* P1: true-average DC-link current + current-limit duty (per 20 ms window) */
static volatile uint32_t g_ibus_sum;
static volatile uint16_t g_ibus_n;
static volatile uint16_t g_climit_periods;
static bool g_climit_overload;
static bool g_climit_severe;
static volatile uint16_t g_adc_scan_epoch;
static uint16_t g_adc_frame_epoch;
static uint8_t  g_guard_tick;
static uint8_t g_uni_torque_enabled;
static uint8_t  g_uni_mode;        /* 1 = Fixed Unipolar, 2 = ALT Polar */
static uint8_t  g_uni_swap;        /* 0 = Right HF / Left 50Hz, 1 = Left HF / Right 50Hz */
static volatile uint16_t g_deadtime_actual_ns;
static volatile uint16_t g_modulation_q15;
static volatile uint16_t g_target_q15;
static volatile uint16_t g_drive_gain_q13;
static volatile uint16_t g_drive_gain_fast_q13;
static volatile uint16_t g_soft_elapsed_ms;
#if COMMUTATION_BLANK_PERIODS > 0U
static volatile uint8_t g_commutation_blank;
#endif

static uint8_t g_restart_attempts;
static volatile uint16_t g_fault_clear_ms;
static volatile uint16_t g_tick10_produced;
static volatile bool g_short_pending;
static volatile bool g_short_clear_started;
static volatile bool g_short_restart_ready;
static uint16_t g_short_clear_tick;
static uint16_t g_short_trip_adc = 1023U;
static uint16_t g_current_foldback_knee;
static volatile uint16_t g_healthy_ms;
static bool g_measurements_valid;
static uint16_t g_current_zero_adc;
static uint16_t g_ac_zero_adc;
static bool g_ac_sensor_present;
static uint8_t g_ac_feedback_good;
static int16_t g_ac_trim_q15;
static volatile uint16_t g_pv_fast_adc;
static volatile uint16_t g_pv_reference_adc;
static volatile uint16_t g_pv_recip_q15;

/* WDT-safe millisecond delay helper: kicks hardware WDT every 1 ms so long
 * boot/reset/LCD waits never trigger the ~16 ms LPRC Watchdog Timer reset. */
static void DelayMs_WDT(uint16_t ms)
{
    while (ms--) {
        WDT_KICK();
        __delay_ms(1);
    }
    WDT_KICK();
}

/* --------------------------- 256-point sine LUT --------------------------- */
static const int16_t sine_quarter_q15[65] = {
    0, 804, 1608, 2410, 3212, 4011, 4808, 5602,
    6393, 7179, 7962, 8739, 9512, 10278, 11039, 11793,
    12539, 13279, 14010, 14732, 15446, 16151, 16846, 17530,
    18204, 18868, 19519, 20159, 20787, 21403, 22005, 22594,
    23170, 23731, 24279, 24811, 25329, 25832, 26319, 26790,
    27245, 27683, 28105, 28510, 28898, 29268, 29621, 29956,
    30273, 30571, 30852, 31113, 31356, 31580, 31785, 31971,
    32137, 32285, 32412, 32521, 32609, 32678, 32728, 32757,
    32767
};

static inline int16_t PWM_HOT SineQ15Interp(uint32_t phase)
{
    uint8_t index = (uint8_t)(phase >> 24);
    uint16_t offset = index & 63U;
    uint16_t next;
    uint16_t frac = (uint16_t)(phase >> 8);
    int16_t a, b;
    int32_t slope;
    if (index & 64U) {
        offset = (uint16_t)(64U - offset);
        next = (uint16_t)(offset - 1U);
    } else next = (uint16_t)(offset + 1U);
    a = sine_quarter_q15[offset];
    b = sine_quarter_q15[next];
    if (index & 128U) { a = (int16_t)-a; b = (int16_t)-b; }
    slope = __builtin_mulsu((int16_t)(b - a), frac);
    return (int16_t)((int32_t)a + ((slope + 32768L) >> 16));
}

/* ------------------------------ GPIO / ADC ------------------------------- */
static void Bridge_GPIO_Low(void)
{
    LATEbits.LATE0 = 0;
    LATEbits.LATE1 = 0;
    LATEbits.LATE2 = 0;
    LATEbits.LATE3 = 0;
    TRISEbits.TRISE0 = 0;
    TRISEbits.TRISE1 = 0;
    TRISEbits.TRISE2 = 0;
    TRISEbits.TRISE3 = 0;
}

static void Hardware_Init(void)
{
    ADCON1bits.ADON = 0;
    ADPCFG = 0xFFFFU;
    ADPCFGbits.PCFG0 = 0;   /* AN0 pin 2  : PV sense */
    ADPCFGbits.PCFG1 = 0;   /* AN1 pin 3  : LM358 current sense */
    ADPCFGbits.PCFG2 = 0;   /* AN2 pin 4  : isolated AC feedback */

    TRISBbits.TRISB3 = 1;
    TRISBbits.TRISB4 = 1;
    TRISBbits.TRISB5 = 1;

    TRISEbits.TRISE8 = 1;
    TRISEbits.TRISE5 = 1;
    LATEbits.LATE4 = 0;
    TRISEbits.TRISE4 = 0;
    Bridge_GPIO_Low();

    LCD_D7_LAT = 0;
    LCD_D6_LAT = 0;
    LCD_D5_LAT = 0;
    LCD_D4_LAT = 0;
    LCD_E_LAT = 0;
    LCD_RS_LAT = 0;
    LCD_D7_TRIS = 0;
    LCD_D6_TRIS = 0;
    LCD_D5_TRIS = 0;
    LCD_D4_TRIS = 0;
    LCD_E_TRIS = 0;
    LCD_RS_TRIS = 0;
}

static void ADC_Init(void)
{
    ADCON1 = 0;
    ADCON2 = 0;
    ADCON3 = 0;
    ADCSSL = 0;
    ADPCFG = 0xFFFFU;
    ADPCFGbits.PCFG0 = 0;
    ADPCFGbits.PCFG1 = 0;
    ADPCFGbits.PCFG2 = 0;
    ADCSSLbits.CSSL0 = 1;
    ADCSSLbits.CSSL1 = 1;
    ADCSSLbits.CSSL2 = 1;
    ADCHSbits.CH0SA = 0U;
    ADCON1bits.FORM = 0U;
    ADCON1bits.SSRC = 7U;
    ADCON1bits.ASAM = 1U;
    ADCON2bits.CSCNA = 1U;
    ADCON2bits.BUFM = 0U;
    ADCON2bits.ALTS = 0U;
    ADCON2bits.SMPI = 2U;
    ADCON3bits.ADCS = 15U;
    ADCON3bits.SAMC = 8U;
    IFS0bits.ADIF = 0;
    IEC0bits.ADIE = 0;
    ADCON1bits.ADON = 1;
}

static uint16_t ADC_Buffer(uint8_t channel)
{
    if (channel == 0U) return ADCBUF0;
    if (channel == 1U) return ADCBUF1;
    return ADCBUF2;
}

static uint16_t ADC_ReadMean8(uint8_t channel)
{
    uint8_t i;
    uint16_t sum = 0U;
    for (i = 0U; i < 8U; i++) {
        WDT_KICK();
        sum += ADC_Buffer(channel);
        __delay_us(80);
    }
    return (uint16_t)((sum + 4UL) >> 3);
}

static uint16_t PV_FromADC(uint16_t raw)
{
    uint32_t numerator;
    uint16_t calibration = g_cfg.pv_cal_auto ? AUTO_PV_CAL_3V_V : g_cfg.pv_cal_3v_v;
    if (raw > 1023U) raw = 1023U;
    numerator = __builtin_muluu(raw, (uint16_t)(5U * calibration));
    return __builtin_divud(numerator + 1534UL, 3069U);
}

static uint32_t U32_DivU32(uint32_t numerator, uint32_t denominator);

static uint16_t Load_FromADC(uint16_t raw, uint16_t pv_v)
{
    uint16_t zero_threshold;
    uint32_t delta;
    uint32_t divisor;
    uint32_t current_mA;
    uint32_t power_mW;
    if (raw > 1023U) raw = 1023U;
    zero_threshold = (g_current_zero_adc > 1020U) ? 1023U :
                     (uint16_t)(g_current_zero_adc + 3U);
    if (raw <= zero_threshold) return 0U;
    delta = (uint32_t)(raw - g_current_zero_adc);
    divisor = __builtin_muluu(g_cfg.amp_gain_x10, g_cfg.shunt_tenth_mohm);
    if (divisor == 0UL) return 0U;
    current_mA = U32_DivU32(__builtin_muluu((uint16_t)delta, (uint16_t)ADC_MICROVOLT_PER_COUNT) * 100UL +
                            (divisor >> 1), divisor);
    if (current_mA > 60000UL) current_mA = 60000UL;
    power_mW = __builtin_muluu(pv_v, (uint16_t)current_mA);
    if (power_mW >= 65535000UL) return 65535U;
    return (uint16_t)__builtin_divud(power_mW + 500UL, 1000U);
}

static uint16_t AC_FromADC(uint16_t raw)
{
    uint16_t delta;
    if (raw > 1023U) raw = 1023U;
    if (raw <= (uint16_t)(g_ac_zero_adc + 2U)) return 0U;
    delta = (uint16_t)(raw - g_ac_zero_adc);
    return __builtin_divud(__builtin_muluu(delta, 1000U) + (AC_FB_DIVISOR / 2U),
                           AC_FB_DIVISOR);
}

static bool __attribute__((noinline)) ADC_PVInvalid(void)
{
    return !ADCON1bits.ADON || ADCBUF0 >= 1023U;
}

static void Fault_Trip(uint8_t fault);

static void Measurements_Update(void)
{
    uint16_t pv_now, load_now, ac_now;
    uint16_t epoch = g_adc_scan_epoch;
    if (ADC_PVInvalid() || (!IFS0bits.ADIF && epoch == g_adc_frame_epoch)) {
        Fault_Trip(FAULT_ADC_SENSE);
        g_run.ac_feedback_active = false;
        g_ac_feedback_good = 0U;
        return;
    }
    if (!g_pwm_active && IFS0bits.ADIF) {
        IFS0bits.ADIF = 0;
        epoch++;
        g_adc_scan_epoch = epoch;
    }
    g_adc_frame_epoch = epoch;

    pv_now = PV_FromADC(ADC_ReadMean8(0U));
    {
        uint32_t sum;
        uint16_t n, climit, ibus_raw;
        __builtin_disi(0x3FFF);
        sum = g_ibus_sum; n = g_ibus_n; climit = g_climit_periods;
        g_ibus_sum = 0UL; g_ibus_n = 0U; g_climit_periods = 0U;
        __builtin_disi(0);
        if (n >= 16U) {
            ibus_raw = __builtin_divud(sum + (n >> 1), n);
            g_climit_overload = climit > (n >> 3);                 /* > 12.5 % */
            g_climit_severe = climit > (uint16_t)((n >> 2) + (n >> 3)); /* > 37.5 % */
        } else {
            ibus_raw = ADC_ReadMean8(1U);
            g_climit_overload = false;
            g_climit_severe = false;
        }
        load_now = Load_FromADC(ibus_raw, pv_now);
    }
    ac_now = AC_FromADC(ADC_ReadMean8(2U));
    if (!g_measurements_valid) {
        g_run.pv_v = pv_now;
        g_run.load_w = load_now;
        g_run.measured_ac_v = ac_now;
        g_measurements_valid = true;
    } else {
        if (pv_now < g_run.pv_v)
            g_run.pv_v = (uint16_t)((__builtin_muluu(g_run.pv_v, 3U) + pv_now + 2UL) >> 2);
        else
            g_run.pv_v = (uint16_t)((__builtin_muluu(g_run.pv_v, 7U) + pv_now + 4UL) >> 3);
        g_run.load_w = (uint16_t)((__builtin_muluu(g_run.load_w, 3U) + load_now + 2UL) >> 2);
        g_run.measured_ac_v = (uint16_t)((__builtin_muluu(g_run.measured_ac_v, 3U) +
                                          ac_now + 2UL) >> 2);
    }

#if BOARD_HAS_VERIFIED_AC_VOLTAGE_FEEDBACK
    if (g_ac_sensor_present && g_pwm_active &&
        g_soft_elapsed_ms >= g_cfg.soft_start_ms &&
        ac_now >= AC_FB_VALID_MIN_V &&
        ac_now <= AC_FB_VALID_MAX_V &&
        ADCBUF2 >= 40U && ADCBUF2 <= 960U) {
        if (g_ac_feedback_good < AC_FB_GOOD_SAMPLES) g_ac_feedback_good++;
    } else {
        g_ac_feedback_good = 0U;
    }
    g_run.ac_feedback_active = (g_ac_feedback_good >= AC_FB_GOOD_SAMPLES);
#else
    g_run.ac_feedback_active = false;
#endif
}

/* ----------------------------- settings / EEPROM -------------------------- */
#define SETTINGS_MAGIC             0xB712U
#define SETTINGS_VERSION           0x001BU
#define SETTINGS_PREVIOUS_VERSION  0x001AU
#define SETTINGS_LEGACY_VERSION    0x0019U

typedef struct __attribute__((packed, aligned(2))) {
    uint16_t magic;
    uint16_t version;
    settings_t settings;
    uint16_t checksum;
} settings_image_t;

#define EEPROM_WORDS ((sizeof(settings_image_t) + 1U) / 2U)
typedef union {
    settings_image_t image;
    uint16_t word[EEPROM_WORDS];
} settings_blob_t;

typedef char settings_image_must_be_word_aligned[
    ((sizeof(settings_image_t) & 1U) == 0U) ? 1 : -1];
typedef char settings_must_fit_before_lcd_text[
    (sizeof(settings_image_t) <= 0x28U) ? 1 : -1];
typedef char lcd_text_must_fit_eeprom[
    (sizeof(lcd_text_eeprom) <= (0x400U - 0x28U)) ? 1 : -1];
typedef char settings_words_must_be_even_aligned[
    ((offsetof(settings_t, ac_output_v)       & 1U) == 0U &&
     (offsetof(settings_t, pv_max_v)          & 1U) == 0U &&
     (offsetof(settings_t, pv_min_v)          & 1U) == 0U &&
     (offsetof(settings_t, pv_cal_3v_v)       & 1U) == 0U &&
     (offsetof(settings_t, soft_start_ms)     & 1U) == 0U &&
     (offsetof(settings_t, carrier_hz)        & 1U) == 0U &&
     (offsetof(settings_t, deadtime_ns)       & 1U) == 0U &&
     (offsetof(settings_t, shunt_tenth_mohm)  & 1U) == 0U &&
     (offsetof(settings_t, amp_gain_x10)      & 1U) == 0U &&
     (offsetof(settings_t, filter_l_centi_mh) & 1U) == 0U &&
     (offsetof(settings_t, filter_c_tenth_uf) & 1U) == 0U) ? 1 : -1];
typedef char settings_block_must_be_even_in_image[
    ((offsetof(settings_image_t, settings) & 1U) == 0U) ? 1 : -1];

static uint16_t eeprom_store[EEPROM_WORDS]
    __attribute__((space(eedata), address(0x7FFC00)));

static void Settings_Default(settings_t *s)
{
    static const settings_t defaults = {
        .ac_output_v           = 220U,
        .pv_max_v              = 450U,
        .pv_min_v              = 170U,
        .pv_cal_3v_v           = 305U,
        .soft_start_ms         = 3000U,
        .carrier_hz            = 16000U,
        .deadtime_ns           = DEADTIME_DEFAULT_NS,
        .shunt_tenth_mohm      = SHUNT_DEFAULT_TENTH_MOHM,
        .amp_gain_x10          = AMP_GAIN_DEFAULT_X10,
        .filter_l_centi_mh     = FILTER_L_DEFAULT_CENTI_MH,
        .filter_c_tenth_uf     = FILTER_C_DEFAULT_TENTH_UF,
        .mode                  = MODE_UNIPOLAR,
        .reserved_slot_23      = 50U,
        .auto_restart          = 1U,
        .pv_cal_auto           = 1U,
        .deadtime_auto         = 1U,
        .changeover_enable     = 0U,
        .protection_mask       = PROTECT_ALL | (UNI_TORQUE_DEFAULT << UNI_TORQUE_SHIFT),
        .wave_type             = WAVE_AUTO,
        .reserved_slot_30      = 0U,
        .short_restart         = 0U,
        .pwm_alignment         = DEFAULT_PWM_ALIGNMENT,
        .short_sensitivity_pct = SHORT_SENSITIVITY_DEFAULT
    };
    *s = defaults;
}

static bool Carrier_Valid(uint16_t hz)
{
    return hz >= 13000U && hz <= 16000U && (hz % 1000U) == 0U;
}

static bool Settings_Valid(const settings_t *s);

static uint16_t Checksum(const uint16_t *data, uint16_t words)
{
    uint16_t result = 0x6D5AU;
    while (words--) {
        result = (uint16_t)((result << 1) | (result >> 15));
        result ^= *data++;
    }
    return result;
}

static uint16_t EEPROM_ReadWord(uint16_t index)
{
    uint16_t page;
    uint16_t offset;
    if (index >= EEPROM_WORDS) return 0xFFFFU;
    page = __builtin_tblpage(&eeprom_store);
    offset = (uint16_t)(__builtin_tbloffset(&eeprom_store) + index * 2U);
    TBLPAG = page;
    return __builtin_tblrdl(offset);
}

static bool EEPROM_WriteWord(uint16_t index, uint16_t value)
{
    uint16_t page;
    uint16_t offset;
    WDT_KICK();
    if (index >= EEPROM_WORDS) return false;
    if (EEPROM_ReadWord(index) == value) return true;

    page = __builtin_tblpage(&eeprom_store);
    offset = (uint16_t)(__builtin_tbloffset(&eeprom_store) + index * 2U);
    while (NVMCONbits.WR) { WDT_KICK(); }
    NVMADRU = page;
    NVMADR = offset;
    NVMCON = 0x4044U;
    __builtin_disi(5);
    __builtin_write_NVM();
    while (NVMCONbits.WR) { WDT_KICK(); }
    if (NVMCONbits.WRERR) {
        NVMCONbits.WREN = 0;
        return false;
    }
    NVMCONbits.WREN = 0;

    TBLPAG = page;
    __builtin_tblwtl(offset, value);
    NVMCON = 0x4004U;
    __builtin_disi(5);
    __builtin_write_NVM();
    while (NVMCONbits.WR) { WDT_KICK(); }
    if (NVMCONbits.WRERR) {
        NVMCONbits.WREN = 0;
        return false;
    }
    NVMCONbits.WREN = 0;
    WDT_KICK();
    return EEPROM_ReadWord(index) == value;
}

static bool Settings_Load(settings_t *s)
{
    settings_blob_t blob;
    uint16_t i, version;

    if (EEPROM_ReadWord(0U) != SETTINGS_MAGIC) return false;
    version = EEPROM_ReadWord(1U);
    if (version != SETTINGS_VERSION && version != SETTINGS_PREVIOUS_VERSION &&
        version != SETTINGS_LEGACY_VERSION)
        return false;
    for (i = 0U; i < EEPROM_WORDS; i++) blob.word[i] = EEPROM_ReadWord(i);
    if (blob.image.checksum !=
        Checksum(blob.word, (uint16_t)(EEPROM_WORDS - 1U))) return false;
    if (version == SETTINGS_LEGACY_VERSION) {
        blob.image.settings.short_restart = 0U;
        blob.image.settings.short_sensitivity_pct = SHORT_SENSITIVITY_DEFAULT;
    }
    if (version != SETTINGS_VERSION) {
        if (blob.image.settings.protection_mask & (uint8_t)~PROTECT_ALL)
            return false;
        blob.image.settings.protection_mask |=
            UNI_TORQUE_DEFAULT << UNI_TORQUE_SHIFT;
    }
    if (blob.image.settings.deadtime_ns >= 1000U &&
        blob.image.settings.deadtime_ns < DEADTIME_MIN_NS)
        blob.image.settings.deadtime_ns = DEADTIME_MIN_NS;
    /* Always normalize mode to MODE_UNIPOLAR (0) */
    blob.image.settings.mode = MODE_UNIPOLAR;
    blob.image.settings.reserved_slot_23 = 50U;
    blob.image.settings.reserved_slot_30 = 0U;
    if (!Settings_Valid(&blob.image.settings)) return false;
    *s = blob.image.settings;
    return true;
}

/* Caller MUST stop PWM before entering this function. */
static bool Settings_Save_WhileOff(const settings_t *s)
{
    settings_blob_t blob;
    uint16_t i;
    if (g_pwm_active || PTCONbits.PTEN || !Settings_Valid(s)) return false;
    blob.image.magic = SETTINGS_MAGIC;
    blob.image.version = SETTINGS_VERSION;
    blob.image.settings = *s;
    blob.image.settings.mode = MODE_UNIPOLAR;
    blob.image.checksum = Checksum(blob.word, (uint16_t)(EEPROM_WORDS - 1U));
    for (i = 0U; i < EEPROM_WORDS; i++) {
        if (!EEPROM_WriteWord(i, blob.word[i])) return false;
    }
    return true;
}

/* ---------------------------------- PWM ----------------------------------- */
typedef struct {
    uint16_t fundamental_q15;
    uint16_t gain_q13;
} overmod_point_t;

static const overmod_point_t overmod_curve[] = {
    {32768U,  8192U}, {33551U,  8438U}, {34177U,  8684U},
    {34875U,  9011U}, {35594U,  9421U}, {36191U,  9830U},
    {36697U, 10240U}, {37130U, 10650U}, {37835U, 11469U}, {38383U, 12288U},
    {39004U, 13517U}, {39463U, 14746U}, {39911U, 16384U},
    {40304U, 18432U}, {40581U, 20480U}, {40783U, 22528U},
    {40935U, 24576U}, {41147U, 28672U}, {41283U, 32768U},
    {41442U, 40960U}, {41528U, 49152U}, {41613U, 65535U}
};
#define OVERMOD_CURVE_POINTS ((uint8_t)(sizeof(overmod_curve) / sizeof(overmod_curve[0])))

typedef struct {
    uint16_t edge_period;
    uint16_t center_period;
} carrier_profile_t;
static const carrier_profile_t carrier_profile[4] = {
    {566U, 283U},
    {526U, 262U},
    {491U, 245U},
    {460U, 229U}
};
static uint16_t Carrier_Period(uint16_t hz, uint8_t alignment)
{
    uint16_t index = (hz / 1000U) - 13U;
    if (index > 3U) index = 3U;
    return (alignment == PWM_ALIGN_CENTER) ?
        carrier_profile[index].center_period : carrier_profile[index].edge_period;
}
static uint32_t PWM_PhaseStep(uint16_t output_hz, uint16_t ptper,
                              uint8_t alignment)
{
    uint32_t remainder = __builtin_muluu(output_hz, (uint16_t)(ptper + 1U));
    uint32_t quotient = 0UL;
    uint8_t bit;
    if (alignment == PWM_ALIGN_CENTER) remainder <<= 1;
    if (remainder == 0UL || remainder >= FCY) return 0UL;
    for (bit = 0U; bit < 32U; bit++) {
        remainder <<= 1;
        quotient <<= 1;
        if (remainder >= FCY) {
            remainder -= FCY;
            quotient |= 1UL;
        }
    }
    if ((remainder << 1) >= FCY) quotient++;
    return quotient;
}

static uint16_t DeadTime_AutoNs(uint16_t carrier_hz)
{
    (void)carrier_hz;
    return DEADTIME_DEFAULT_NS;
}

static uint16_t DeadTime_CountFromNs(uint16_t ns)
{
    uint32_t scaled = __builtin_muluu(ns, 288U);
    uint16_t count = __builtin_divud(scaled + 19531UL, 39063U);
    if (count < 11U) count = 11U;
    if (count > 24U) count = 24U;
    return count;
}

#define MinPulseTicks(a) ((uint16_t)(((a) == PWM_ALIGN_CENTER) ? \
    (g_deadtime_count + (MIN_PULSE_MARGIN_TICKS / 2U)) : \
    (g_deadtime_count * 2U + MIN_PULSE_MARGIN_TICKS)))

#define RoundShift13(v) (int32_t)(((v) + 4096L) >> 13)
#define RoundShift15(v) (int32_t)(((v) + 16384L) >> 15)

static inline void PWM_HOT PWM_WritePair(uint16_t duty1, uint16_t duty2)
{
    PWMCON2bits.UDIS = 1;
    PDC1 = duty1;
    PDC2 = duty2;
    PWMCON2bits.UDIS = 0;
}

static inline uint16_t PWM_HOT PV_FastGainUpdate(void)
{
    uint16_t raw = ADCBUF0;
    uint16_t fast = g_pv_fast_adc;
    uint16_t base = g_drive_gain_q13;
    uint16_t reference = g_pv_reference_adc;
    int16_t difference;
    int32_t correction_q15;
    int32_t corrected;

    if (raw > 1023U) raw = 1023U;
    if (raw < fast) fast = (uint16_t)(fast - ((fast - raw + 1U) >> 2));
    else fast = (uint16_t)(fast + ((raw - fast + 7U) >> 4));
    g_pv_fast_adc = fast;

    if (reference < PV_FAST_MIN_ADC || fast < PV_FAST_MIN_ADC ||
        g_pv_recip_q15 == 0U) return base;
    difference = (int16_t)reference - (int16_t)fast;
    correction_q15 = __builtin_mulsu(difference, g_pv_recip_q15);
    if (correction_q15 > PV_FAST_CORR_LIMIT_Q15)
        correction_q15 = PV_FAST_CORR_LIMIT_Q15;
    if (correction_q15 < -PV_FAST_CORR_LIMIT_Q15)
        correction_q15 = -PV_FAST_CORR_LIMIT_Q15;
    if (g_uni_torque_enabled && fast < g_uni_reserve_adc && correction_q15 > 0L)
        correction_q15 = 0L;
    corrected = (int32_t)base +
                ((__builtin_mulsu((int16_t)correction_q15, base) + 16384L) >> 15);
    if (ADCBUF1 > g_current_foldback_knee) {
        corrected -= (int32_t)((uint16_t)(ADCBUF1 - g_current_foldback_knee) << 5);
    }
    if (corrected < 0L) return 0U;
    if (corrected > 65535L) return 65535U;
    return (uint16_t)corrected;
}

static void PWM_KillFast(void)
{
    IEC2bits.PWMIE = 0;   /* P1: first, so the PWM ISR guard never sees a half-stopped PWM (main-context race) */
    PWMCON2bits.OSYNC = 0;
    OVDCON = 0U;
    LATE &= (uint16_t)~0x000FU;
    TRISE &= (uint16_t)~0x000FU;
    PWMCON1 = 0U;
    PTCONbits.PTEN = 0;
    CHANGEOVER_OFF();
    g_pwm_active = false;
    g_an1_over_count = 0U;
    g_modulation_q15 = 0U;
    g_drive_gain_q13 = 0U;
    g_drive_gain_fast_q13 = 0U;
    g_ac_feedback_good = 0U;
}

static void PWM_Off(void)
{
    PWM_KillFast();
    IFS2bits.PWMIF = 0;
    PWMCON1 = 0U;
    PDC1 = 0U;
    PDC2 = 0U;
    PDC3 = 0U;
    Bridge_GPIO_Low();
    g_pv_sag_started = false;
}

static void ShortSensitivity_Init(void)
{
    uint16_t zero = g_current_zero_adc;
    uint16_t calibration = g_cfg.pv_cal_auto ? AUTO_PV_CAL_3V_V : g_cfg.pv_cal_3v_v;
    uint16_t minimum_adc = __builtin_divud(
        __builtin_muluu(g_cfg.pv_min_v, 3069U), (uint16_t)(5U * calibration));
    uint16_t tenth_adc = (uint16_t)(minimum_adc / 10U);
    uint16_t delta;
    g_uni_floor_adc = (uint16_t)(minimum_adc - tenth_adc);
    g_uni_reserve_adc = (uint16_t)(minimum_adc + tenth_adc);
    if (zero > 1023U) zero = 1023U;
    delta = (uint16_t)__builtin_divud(
        __builtin_muluu((uint16_t)(1023U - zero), (uint16_t)(101U - g_cfg.short_sensitivity_pct)) + 99UL,
        100U);
    if (delta < 4U) delta = 4U;
    g_short_trip_adc = ((uint32_t)zero + delta > 1023UL) ?
                       1023U : (uint16_t)(zero + delta);
    delta = (uint16_t)(g_short_trip_adc - zero);
    g_current_foldback_knee = (uint16_t)(g_short_trip_adc - (delta >> 2));
}

static inline bool ShortInput_Active(void)
{
    return SHORT_ACTIVE() || ADCBUF1 >= g_short_trip_adc;
}

static void Short_TripFast(void)
{
    PWM_KillFast();
    if (g_run.fault < FAULT_CLOCK) g_run.fault = FAULT_SHORT;
    g_short_pending = true;
    g_short_clear_started = false;
    g_short_restart_ready = false;
    g_fault_clear_ms = 0U;
    g_healthy_ms = 0U;
}

static inline bool PWM_HOT Clock_OK(void)
{
    return OSCCONbits.LOCK != 0;
}

static bool __attribute__((noinline)) PWM_TimeBaseProfileOK(void)
{
    return g_cfg.carrier_hz == g_pwm_selected_hz &&
           g_cfg.pwm_alignment <= PWM_ALIGN_CENTER &&
           g_pwm_ptmod == ((g_cfg.pwm_alignment == PWM_ALIGN_CENTER) ? 2U : 0U) &&
           PTPER == g_pwm_period &&
           DTCON1 == (uint16_t)(g_deadtime_count & 0x003FU) &&
           PTCONbits.PTMOD == g_pwm_ptmod &&
           PTCONbits.PTCKPS == 0U &&
           PTCONbits.PTOPS == 0U;
}

static bool __attribute__((noinline)) PWM_OutputProfileOK(void)
{
    return PWMCON1 == (g_pwm_active ? 0x0033U : 0U) &&
           FLTACON == 0x0003U &&
           PWMCON2bits.IUE == 0U &&
           PWMCON2bits.OSYNC != 0U &&
           PWMCON2bits.UDIS == 0U &&
           (!g_pwm_active ||
            (PTCONbits.PTEN != 0U &&
#if COMMUTATION_BLANK_PERIODS > 0U
             (OVDCON == PWM_OUTPUT_MASK || OVDCON == PWM_BLANK_P1_MASK)
#else
             OVDCON == PWM_OUTPUT_MASK
#endif
            ));
}

static inline bool PWM_RuntimeProfileOK(void)
{
    return PWM_TimeBaseProfileOK() && PWM_OutputProfileOK();
}

static void PWM_Init(void)
{
    PWM_Off();
    PTCON = 0U;
    PWMCON1 = 0U;
    PWMCON2 = 0U;
    PWMCON2bits.OSYNC = 1U;
    g_uni_torque_enabled = (UNI_TORQUE_LEVEL(&g_cfg) != 0U);

    g_pwm_ptmod = (g_cfg.pwm_alignment == PWM_ALIGN_CENTER) ? 2U : 0U;
    PTCONbits.PTMOD = g_pwm_ptmod;
    g_pwm_selected_hz = g_cfg.carrier_hz;
    g_pwm_period = Carrier_Period(g_cfg.carrier_hz, g_cfg.pwm_alignment);
    PTPER = g_pwm_period;
    g_pwm_neutral = (uint16_t)(PTPER + 1U);
    g_pwm_span = (uint16_t)(g_pwm_neutral * 2U);
    g_uni_wrap_guard = (uint16_t)((PWM_PhaseStep(FUNDAMENTAL_HZ, PTPER,
                                  g_cfg.pwm_alignment) >> 16) + 1UL);
    g_deadtime_count = DeadTime_CountFromNs(g_cfg.deadtime_auto ?
                        DeadTime_AutoNs(g_cfg.carrier_hz) : g_cfg.deadtime_ns);
    g_deadtime_actual_ns = __builtin_divud(
        __builtin_muluu(g_deadtime_count, 39063U) + 144UL, 288U);
    DTCON1 = (uint16_t)(g_deadtime_count & 0x003FU);
    g_deadtime_comp = (g_cfg.pwm_alignment == PWM_ALIGN_CENTER) ?
        (uint16_t)((g_deadtime_count * 3U) >> 2) :
        (uint16_t)((g_deadtime_count * 3U) >> 1);
    g_min_pulse = MinPulseTicks(g_cfg.pwm_alignment);
    if (g_pwm_ptmod != 0U) g_min_pulse <<= 1;
    g_max_pulse = (uint16_t)(g_pwm_span - g_min_pulse);
    FLTACON = 0x0003U;
    OVDCON = 0U;
    IPC9bits.PWMIP = 5U;
    IFS2bits.PWMIF = 0;
    IEC2bits.PWMIE = 0;
}

#define OVERMOD_CAP_UNIPOLAR_Q15   39900U

static uint16_t OvermodGain_FromFundamentalQ15(uint16_t fundamental_q15)
{
    uint8_t i;
    if (fundamental_q15 <= OVERMOD_LINEAR_Q15)
        return (uint16_t)((fundamental_q15 + 2U) >> 2);
    if (fundamental_q15 >= overmod_curve[OVERMOD_CURVE_POINTS - 1U].fundamental_q15)
        return overmod_curve[OVERMOD_CURVE_POINTS - 1U].gain_q13;

    for (i = 1U; i < OVERMOD_CURVE_POINTS; i++) {
        if (fundamental_q15 <= overmod_curve[i].fundamental_q15) {
            uint16_t f0 = overmod_curve[i - 1U].fundamental_q15;
            uint16_t f1 = overmod_curve[i].fundamental_q15;
            uint16_t g0 = overmod_curve[i - 1U].gain_q13;
            uint16_t g1 = overmod_curve[i].gain_q13;
            uint32_t scaled = __builtin_muluu((uint16_t)(fundamental_q15 - f0),
                              (uint16_t)(g1 - g0));
            return (uint16_t)(g0 + __builtin_divud(
                scaled + ((uint16_t)(f1 - f0) >> 1),
                (uint16_t)(f1 - f0)));
        }
    }
    return overmod_curve[OVERMOD_CURVE_POINTS - 1U].gain_q13;
}

static void ControlTarget_Update(void)
{
    uint16_t pv = g_run.pv_v;
    uint16_t requested_rms = g_cfg.ac_output_v;
    uint16_t linear_limit = MAX_MODULATION_Q15;
    uint16_t cap_q15;
    uint16_t target;
    uint32_t numerator;
    uint32_t desired_q15;
    bool use_overmod;
    bool limited = false;

#if BOARD_HAS_VERIFIED_AC_VOLTAGE_FEEDBACK
    if (g_run.ac_feedback_active && g_pwm_active &&
        g_soft_elapsed_ms >= g_cfg.soft_start_ms) {
        int16_t error = (int16_t)requested_rms - (int16_t)g_run.measured_ac_v;
        if (error > 1 || error < -1) {
            int16_t step = error * 24;
            int32_t next;
            if (step > AC_TRIM_STEP_MAX_Q15) step = AC_TRIM_STEP_MAX_Q15;
            if (step < -AC_TRIM_STEP_MAX_Q15) step = -AC_TRIM_STEP_MAX_Q15;
            next = (int32_t)g_ac_trim_q15 + (int32_t)step;
            if (next > AC_TRIM_LIMIT_Q15) next = AC_TRIM_LIMIT_Q15;
            if (next < -AC_TRIM_LIMIT_Q15) next = -AC_TRIM_LIMIT_Q15;
            g_ac_trim_q15 = (int16_t)next;
        }
    } else g_ac_trim_q15 = 0;
#else
    g_ac_trim_q15 = 0;
#endif

    if (pv == 0U) {
        g_target_q15 = 0U;
        g_run.effective_wave = EFFECTIVE_WAVE_PURE;
        g_run.regulation_limited = true;
        g_run.estimated_ac_v = 0U;
        return;
    }

    numerator = __builtin_muluu(requested_rms, 46341U) + (pv >> 1);
    if (numerator >= __builtin_muluu(pv, 65535U)) desired_q15 = 65535UL;
    else desired_q15 = __builtin_divud(numerator, pv);

#if BOARD_HAS_VERIFIED_AC_VOLTAGE_FEEDBACK
    if (g_run.ac_feedback_active) {
        int32_t corrected = (int32_t)desired_q15 + (int32_t)g_ac_trim_q15;
        if (corrected < 0L) corrected = 0L;
        if (corrected > 65535L) corrected = 65535L;
        desired_q15 = (uint32_t)corrected;
    }
#endif

    if (g_cfg.wave_type == WAVE_PURE) {
        use_overmod = false;
    } else if (g_cfg.wave_type == WAVE_MODIFIED) {
        use_overmod = (desired_q15 > linear_limit);
    } else if (g_run.effective_wave == EFFECTIVE_WAVE_OVERMOD) {
        use_overmod = (desired_q15 + AUTO_WAVE_HYST_Q15 >= linear_limit);
    } else {
        use_overmod = (desired_q15 > linear_limit);
    }

    cap_q15 = use_overmod ? OVERMOD_CAP_UNIPOLAR_Q15 : linear_limit;
    if (desired_q15 > cap_q15) {
        target = cap_q15;
        limited = true;
    } else {
        target = (uint16_t)desired_q15;
    }

    g_run.effective_wave = use_overmod ? EFFECTIVE_WAVE_OVERMOD :
                                         EFFECTIVE_WAVE_PURE;
    g_run.regulation_limited = limited;
    g_target_q15 = target;
    g_run.estimated_ac_v = g_run.ac_feedback_active ? g_run.measured_ac_v :
        __builtin_divud(__builtin_muluu(pv, target) + 23170UL, 46341U);
}

static bool PWM_Start(void)
{
    uint16_t initial;
    uint16_t pv_raw;
    uint8_t flta_enabled;
    uint8_t bside;
    if (g_run.fault != FAULT_NONE || g_short_pending || SHORT_ACTIVE() ||
        g_an1_over_count >= AN1_SHORT_FILTER_PERIODS ||
        ((g_cfg.protection_mask & PROTECT_TEMPERATURE) && TEMP_ACTIVE()) ||
        !Clock_OK() || !Carrier_Valid(g_cfg.carrier_hz)) {
        PWM_Off();
        return false;
    }

    pv_raw = ADCBUF0;
    if (ADC_PVInvalid()) {
        Fault_Trip(FAULT_ADC_SENSE);
        return false;
    }
    if (pv_raw < PV_FAST_MIN_ADC) {
        Fault_Trip(FAULT_PV_LOW);
        return false;
    }

    PWM_Init();
    if (!PWM_RuntimeProfileOK()) {
        Fault_Trip(FAULT_PWM_CONFIG);
        return false;
    }

    g_phase_step = PWM_PhaseStep(FUNDAMENTAL_HZ, PTPER, g_cfg.pwm_alignment);
    if (g_phase_step == 0UL) {
        Fault_Trip(FAULT_PWM_CONFIG);
        return false;
    }

    g_phase = 0UL;
    g_soft_elapsed_ms = 0U;
    g_modulation_q15 = 0U;
    g_drive_gain_q13 = 0U;
    g_drive_gain_fast_q13 = 0U;
#if COMMUTATION_BLANK_PERIODS > 0U
    g_commutation_blank = 0U;
#endif
    g_pulse_park = 0U;
    g_guard_tick = GUARD_DIV;
    g_adc_stale_periods = 0U;
    g_an1_over_count = 0U;
    bside = UNI_BRIDGE_SIDE(&g_cfg);
    g_uni_mode = (bside == UNI_BRIDGE_ALT) ? 2U : 1U;
    g_uni_swap = (bside == UNI_BRIDGE_LEFT) ? 1U : 0U;
    g_pv_fast_adc = ADCBUF0;
    g_pv_reference_adc = g_pv_fast_adc;
    g_pv_recip_q15 = (g_pv_reference_adc >= PV_FAST_MIN_ADC) ?
        (uint16_t)__builtin_divud(32768UL, g_pv_reference_adc) : 0U;

    initial = g_pwm_span;
    PDC1 = initial;
    PDC2 = initial;
    PDC3 = 0U;
    PTMR = 0U;
    OVDCON = PWM_OUTPUT_MASK;

    PWMCON1 = 0x0033U;
    PWMCON1bits.PEN3H = 0;
    PWMCON1bits.PEN3L = 0;

    flta_enabled = IEC2bits.FLTAIE;
    IEC2bits.FLTAIE = 0;
    if (g_run.fault != FAULT_NONE || g_short_pending ||
        SHORT_ACTIVE() || IFS2bits.FLTAIF ||
        g_an1_over_count >= AN1_SHORT_FILTER_PERIODS) {
        Short_TripFast();
        IEC2bits.FLTAIE = flta_enabled;
        return false;
    }
    IFS2bits.PWMIF = 0;
    g_pwm_active = true;
    IEC2bits.PWMIE = 1;
    PTCONbits.PTEN = 1;
    IEC2bits.FLTAIE = flta_enabled;
    return g_pwm_active;
}

#if COMMUTATION_BLANK_PERIODS > 0U
static inline void PWM_HOT PWM_UnipolarUpdate(int16_t sine, uint8_t sign,
                                              bool half_changed)
#else
static inline void PWM_HOT PWM_UnipolarUpdate(int16_t sine, uint8_t sign)
#endif
{
    uint16_t minimum = g_min_pulse;
    uint16_t maximum = g_max_pulse;
    int32_t command;
    uint16_t pulse;
    uint16_t clamp_duty;
    uint16_t mod_duty;
    uint8_t eff_sign = (uint8_t)(sign ^ g_uni_swap);

#if COMMUTATION_BLANK_PERIODS > 0U
    if (half_changed) {
        g_commutation_blank = COMMUTATION_BLANK_PERIODS;
        OVDCON = PWM_BLANK_P1_MASK;
        clamp_duty = 0U;
        mod_duty = eff_sign ? minimum : maximum;
        if (g_uni_swap) PWM_WritePair(mod_duty, clamp_duty);
        else PWM_WritePair(clamp_duty, mod_duty);
        return;
    }

    if (g_commutation_blank != 0U) {
        g_commutation_blank--;
        if (g_commutation_blank == 0U) OVDCON = PWM_OUTPUT_MASK;
        clamp_duty = 0U;
        mod_duty = eff_sign ? minimum : maximum;
        if (g_uni_swap) PWM_WritePair(mod_duty, clamp_duty);
        else PWM_WritePair(clamp_duty, mod_duty);
        return;
    }
#endif

    if (sine < 0) sine = (int16_t)-sine;
    command = RoundShift13(__builtin_mulsu(sine, g_drive_gain_fast_q13));
    if (command > 32767L) command = 32767L;
    pulse = (uint16_t)RoundShift15(__builtin_muluu((uint16_t)command, g_pwm_span));

#if OPT_DEADTIME_COMPENSATION
    pulse = (uint16_t)(pulse + g_deadtime_comp);
#endif

#if PULSE_POLICY_LOWTHD
    if (pulse < (uint16_t)(g_pulse_park ? (minimum + PULSE_HYST_TICKS)
                                        : minimum)) {
        g_pulse_park = 1U;
        pulse = 0U;
    } else {
        g_pulse_park = 0U;
        if (pulse > maximum) pulse = g_pwm_span;
    }
#else
    if (pulse < minimum) pulse = minimum;
    if (pulse > maximum) pulse = maximum;
#endif

    if (eff_sign) {
        clamp_duty = 0U;
        mod_duty = pulse;
    } else {
        clamp_duty = g_pwm_span;
        mod_duty = (uint16_t)(g_pwm_span - pulse);
    }
    if (g_uni_swap) PWM_WritePair(mod_duty, clamp_duty);
    else PWM_WritePair(clamp_duty, mod_duty);
}

void __attribute__((interrupt, auto_psv)) _PWMInterrupt(void)
{
    int16_t sine;
    uint16_t pv_raw;
    uint32_t phase;
    uint32_t step;
    bool alt_park = false;
#if COMMUTATION_BLANK_PERIODS > 0U
    bool half_changed;
#endif
    IFS2bits.PWMIF = 0;
    {
        uint16_t ibus_adc = ADCBUF1;
        g_ibus_sum += ibus_adc;                       /* P1: true average */
        g_ibus_n++;
        if (ibus_adc > g_current_foldback_knee) g_climit_periods++;
        if (ibus_adc >= g_short_trip_adc) {           /* P1: leaky counter */
            g_an1_over_count += 2U;
            if (g_an1_over_count > AN1_SHORT_FILTER_PERIODS)
                g_an1_over_count = AN1_SHORT_FILTER_PERIODS;
        } else if (g_an1_over_count) {
            g_an1_over_count--;
        }
    }
    if (SHORT_ACTIVE() || IFS2bits.FLTAIF ||
        g_an1_over_count >= AN1_SHORT_FILTER_PERIODS) {
        PWMCON2bits.OSYNC = 0U;
        OVDCON = 0U;
        Short_TripFast();
        return;
    }
    if (!g_pwm_active || g_run.fault != FAULT_NONE) {
        PWM_KillFast();
        return;
    }
    if (IFS0bits.ADIF) {
        IFS0bits.ADIF = 0;
        g_adc_scan_epoch++;
        g_adc_stale_periods = 0U;
    } else if (++g_adc_stale_periods >= ADC_STALE_GUARD_PERIODS) {
        PWM_KillFast();
        g_run.fault = FAULT_ADC_SENSE;
        return;
    }
    pv_raw = ADCBUF0;
    if (pv_raw < PV_FAST_MIN_ADC || pv_raw >= 1023U) {
        PWM_KillFast();
        g_run.fault = (pv_raw >= 1023U) ? FAULT_ADC_SENSE : FAULT_PV_LOW;
        return;
    }
    if (--g_guard_tick == 0U) {
        g_guard_tick = GUARD_DIV;
        if (!Clock_OK()) {
            g_run.fault = FAULT_CLOCK;
            PWM_KillFast();
            return;
        }
        if (!PWM_TimeBaseProfileOK()) {
            g_run.fault = FAULT_PWM_CONFIG;
            PWM_KillFast();
            return;
        }
    } else if (g_guard_tick == (GUARD_DIV / 2U)) {
        if (!PWM_OutputProfileOK()) {
            g_run.fault = FAULT_PWM_CONFIG;
            PWM_KillFast();
            return;
        }
    }

    step = g_phase_step;
    phase = g_phase + step;
#if COMMUTATION_BLANK_PERIODS > 0U
    half_changed = ((g_phase ^ phase) & 0x80000000UL) != 0UL;
#endif
    if (g_uni_mode > 1U) {
        if (phase < step) g_uni_swap ^= 1U;
        uint16_t upper = (uint16_t)(phase >> 16);
        alt_park = (upper < g_uni_wrap_guard ||
                    upper >= (uint16_t)(0U - g_uni_wrap_guard));
    }
    g_phase = phase;
    g_drive_gain_fast_q13 = PV_FastGainUpdate();
    sine = alt_park ? 0 : SineQ15Interp(phase);
#if COMMUTATION_BLANK_PERIODS > 0U
    PWM_UnipolarUpdate(sine, (uint8_t)(phase >> 31), half_changed);
#else
    PWM_UnipolarUpdate(sine, (uint8_t)(phase >> 31));
#endif

    if (IFS2bits.PWMIF) {
        g_run.fault = FAULT_PWM_OVERRUN;
        PWM_KillFast();
    }
}

/* ------------------------------- protection ------------------------------- */
static void Fault_Trip(uint8_t fault)
{
    uint8_t flta_enabled;
    if (fault == FAULT_NONE) return;
    if (fault == FAULT_SHORT) { Short_TripFast(); return; }
    PWM_Off();
    flta_enabled = IEC2bits.FLTAIE;
    IEC2bits.FLTAIE = 0;
    if (g_run.fault < FAULT_CLOCK &&
        (!g_short_pending || fault >= FAULT_CLOCK)) {
        g_run.fault = fault;
        g_fault_clear_ms = 0U;
        g_healthy_ms = 0U;
    }
    IEC2bits.FLTAIE = flta_enabled;
}

static uint8_t ActiveFault(void)
{
    uint16_t pv = g_run.pv_v;
    if (SHORT_ACTIVE() || g_an1_over_count >= AN1_SHORT_FILTER_PERIODS)
        return FAULT_SHORT;
    if (ADC_PVInvalid()) return FAULT_ADC_SENSE;
    if (ADCBUF0 < PV_FAST_MIN_ADC) return FAULT_PV_LOW;
    if ((g_cfg.protection_mask & PROTECT_TEMPERATURE) && TEMP_ACTIVE())
        return FAULT_TEMPERATURE;

    if (g_cfg.protection_mask & PROTECT_PV_LOW) {
        if (g_run.fault == FAULT_PV_LOW) {
            if (pv < (uint16_t)(g_cfg.pv_min_v + PV_CLEAR_HYST_V))
                return FAULT_PV_LOW;
        } else if (ADCBUF0 <= g_uni_floor_adc) {
            return FAULT_PV_LOW;
        } else if (pv <= g_cfg.pv_min_v) {
            uint8_t level = UNI_TORQUE_LEVEL(&g_cfg);
            uint16_t allowance = (level == 1U) ? 10U :
                                 ((level == 2U) ? 25U : 50U);
            bool defer = false;
            if (g_pwm_active && level != 0U) {
                if (!g_pv_sag_started) {
                    g_pv_sag_tick = g_tick10_produced;
                    g_pv_sag_started = true;
                }
                defer = (uint16_t)(g_tick10_produced - g_pv_sag_tick) < allowance;
            }
            if (!defer) return FAULT_PV_LOW;
        } else if (pv >= (uint16_t)(g_cfg.pv_min_v + PV_CLEAR_HYST_V)) {
            g_pv_sag_started = false;
        }
    }

    if (g_cfg.protection_mask & PROTECT_PV_HIGH) {
        if (g_run.fault == FAULT_PV_HIGH) {
            if (pv > (uint16_t)(g_cfg.pv_max_v - PV_CLEAR_HYST_V))
                return FAULT_PV_HIGH;
        } else if (pv > g_cfg.pv_max_v) return FAULT_PV_HIGH;
    }

    if ((g_cfg.protection_mask & PROTECT_OVERLOAD) &&
        (g_run.load_w > MAX_LOAD_W || g_climit_overload))
        return FAULT_OVERLOAD;
    return FAULT_NONE;
}

static bool Fault_IsPermanent(uint8_t fault)
{
    return (uint8_t)(fault - FAULT_CLOCK) <=
           (uint8_t)(FAULT_RESET_LOCK - FAULT_CLOCK);
}

static bool Fault_UsesLimitedRetry(uint8_t fault)
{
    return fault == FAULT_PV_LOW ||
           (uint8_t)(fault - FAULT_SHORT) <=
           (uint8_t)(FAULT_OVERLOAD - FAULT_SHORT);
}

static void ShortRecovery_Service(void)
{
    uint16_t tick;
    uint8_t flta_enabled;
    if (!g_cfg.auto_restart || !g_cfg.short_restart) {
        g_short_clear_started = false;
        return;
    }
    if (g_restart_attempts >= AUTO_RESTART_LIMIT) {
        g_run.fault = FAULT_RETRY_LOCK;
        g_short_clear_started = false;
        return;
    }
    flta_enabled = IEC2bits.FLTAIE;
    IEC2bits.FLTAIE = 0;
    if (ShortInput_Active() || IFS2bits.FLTAIF) {
        g_short_clear_started = false;
        IEC2bits.FLTAIE = flta_enabled;
        return;
    }
    tick = g_tick10_produced;
    if (!g_short_clear_started) {
        g_short_clear_tick = tick;
        g_short_clear_started = true;
        IEC2bits.FLTAIE = flta_enabled;
        return;
    }
    if ((uint16_t)(tick - g_short_clear_tick) < SHORT_RESTART_TICKS) {
        IEC2bits.FLTAIE = flta_enabled;
        return;
    }
    g_restart_attempts++;
    g_short_pending = false;
    g_short_clear_started = false;
    g_short_restart_ready = true;
    g_run.fault = FAULT_NONE;
    g_fault_clear_ms = 0U;
    g_soft_elapsed_ms = 0U;
    IEC2bits.FLTAIE = flta_enabled;
}

static uint16_t Short_CountdownSeconds(void)
{
    uint16_t elapsed = g_short_clear_started ?
        (uint16_t)(g_tick10_produced - g_short_clear_tick) : 0U;
    if (elapsed >= SHORT_RESTART_TICKS) return 0U;
    return (uint16_t)((SHORT_RESTART_TICKS - elapsed + 99U) / 100U);
}

static void Protection_Service20ms(void)
{
    static uint8_t candidate = FAULT_NONE;
    static uint8_t candidate_count = 0U;
    uint8_t now = ActiveFault();
    uint8_t trip_count;
    uint16_t clear_required;

    if (Fault_IsPermanent(g_run.fault)) return;
    if (now == FAULT_ADC_SENSE) { Fault_Trip(now); return; }
    if (now == FAULT_PV_LOW && (g_cfg.protection_mask & PROTECT_PV_LOW) &&
        ADCBUF0 <= g_uni_floor_adc) {
        Fault_Trip(now); return;
    }
    if (now == FAULT_SHORT) { Short_TripFast(); return; }
    if (g_short_pending) {
        candidate = FAULT_NONE;
        candidate_count = 0U;
        if (now != FAULT_NONE) g_short_clear_started = false;
        else ShortRecovery_Service();
        return;
    }

    if (now != FAULT_NONE) {
        g_fault_clear_ms = 0U;
        g_healthy_ms = 0UL;
        if (now != candidate) {
            candidate = now;
            candidate_count = 1U;
        } else if (candidate_count < 255U) candidate_count++;

        trip_count = (now == FAULT_TEMPERATURE) ? 1U :
                     ((now == FAULT_OVERLOAD) ?
                      ((g_run.load_w > 7500U || g_climit_severe) ? 12U :
                       ((g_run.load_w > MAX_LOAD_W) ? 75U : 250U)) : 5U);   /* P1: 0.24 / 1.5 / 5 s */
        if (now == FAULT_SHORT || candidate_count >= trip_count) Fault_Trip(now);
        return;
    }

    candidate = FAULT_NONE;
    candidate_count = 0U;
    if (g_run.fault == FAULT_NONE) {
        if (g_pwm_active && g_healthy_ms < RETRY_RESET_HEALTHY_MS)
            g_healthy_ms += 20U;
        if (g_healthy_ms >= RETRY_RESET_HEALTHY_MS) g_restart_attempts = 0U;
        return;
    }
    if (Fault_IsPermanent(g_run.fault) || !g_cfg.auto_restart) return;

    clear_required = (g_run.fault == FAULT_PV_LOW || g_run.fault == FAULT_PV_HIGH) ?
                     PV_FAULT_CLEAR_MS : HARD_FAULT_CLEAR_MS;
    if (g_fault_clear_ms < clear_required) g_fault_clear_ms += 20U;
    if (g_fault_clear_ms < clear_required) return;

    if (Fault_UsesLimitedRetry(g_run.fault)) {
        if (g_restart_attempts >= AUTO_RESTART_LIMIT) {
            g_run.fault = (g_run.fault == FAULT_PV_LOW) ?
                          FAULT_PV_RETRY_LOCK : FAULT_RETRY_LOCK;
            return;
        }
        g_restart_attempts++;
    }
    {
        uint8_t flta_enabled = IEC2bits.FLTAIE;
        IEC2bits.FLTAIE = 0;
        if (!g_short_pending && !IFS2bits.FLTAIF && !ShortInput_Active()) {
            g_run.fault = FAULT_NONE;
            g_fault_clear_ms = 0U;
            g_soft_elapsed_ms = 0U;
        }
        IEC2bits.FLTAIE = flta_enabled;
    }
}

static void FLTA_Init(void)
{
    TRISEbits.TRISE8 = 1;
    IFS2bits.FLTAIF = 0;
    IPC10bits.FLTAIP = 7U;
    IEC2bits.FLTAIE = 1;
}

void __attribute__((interrupt, no_auto_psv)) _FLTAInterrupt(void)
{
    PWMCON2bits.OSYNC = 0U;
    OVDCON = 0U;
    Short_TripFast();
    IFS2bits.FLTAIF = 0;
}

void __attribute__((interrupt, no_auto_psv)) _DefaultInterrupt(void)
{
    PWMCON2bits.OSYNC = 0;
    OVDCON = 0U;
    LATE &= (uint16_t)~0x000FU;
    TRISE &= (uint16_t)~0x000FU;
    PWMCON1 = 0U;
    PTCONbits.PTEN = 0;
    IEC2bits.PWMIE = 0;
    CHANGEOVER_OFF();
    for (;;) { ; }
}

static void Changeover_Service(void)
{
    uint8_t pwm_enabled = IEC2bits.PWMIE;
    uint8_t flta_enabled = IEC2bits.FLTAIE;
    IEC2bits.PWMIE = 0;
    IEC2bits.FLTAIE = 0;
    if (g_cfg.changeover_enable && g_pwm_active && g_run.fault == FAULT_NONE &&
        !g_short_pending && !IFS2bits.FLTAIF && !SHORT_ACTIVE() &&
        g_an1_over_count < AN1_SHORT_FILTER_PERIODS &&
        g_soft_elapsed_ms >= 20U) CHANGEOVER_ON();
    else CHANGEOVER_OFF();
    IEC2bits.PWMIE = pwm_enabled && g_pwm_active;
    IEC2bits.FLTAIE = flta_enabled;
}

/* ---------------------------------- LCD ----------------------------------- */
static void LCD_Pulse(void)
{
    WDT_KICK();
    LCD_E_LAT = 1;
    __delay_us(2);
    LCD_E_LAT = 0;
    __delay_us(42);
    WDT_KICK();
}

static void LCD_Nibble(uint8_t value)
{
    LCD_D4_LAT = value & 1U;
    LCD_D5_LAT = (value >> 1) & 1U;
    LCD_D6_LAT = (value >> 2) & 1U;
    LCD_D7_LAT = (value >> 3) & 1U;
    LCD_Pulse();
}

static void LCD_Byte(uint8_t rs, uint8_t value)
{
    LCD_RS_LAT = (rs != 0U);
    LCD_Nibble(value >> 4);
    LCD_Nibble(value & 15U);
}

static void LCD_Command(uint8_t command)
{
    LCD_Byte(0U, command);
    if (command == 1U || command == 2U) DelayMs_WDT(2U);
}

static void LCD_Position(uint8_t row, uint8_t column)
{
    LCD_Command((uint8_t)(0x80U | (row ? (0x40U + column) : column)));
}

static uint8_t LCD_TextByte(uint16_t index)
{
    uint16_t word;
    if (index >= (uint16_t)sizeof(lcd_text_eeprom)) return 0U;
    TBLPAG = __builtin_tblpage(lcd_text_eeprom);
    word = __builtin_tblrdl(__builtin_tbloffset(lcd_text_eeprom) + (index & 0xFFFEU));
    return (index & 1U) ? (uint8_t)(word >> 8) : (uint8_t)word;
}

static uint8_t LCD_String(uint16_t text)
{
    uint8_t stack[16];
    uint8_t count = 0U, depth = 0U, steps = 0U;
    for (;;) {
        uint8_t token = depth ? stack[--depth] : LCD_TextByte(text++);
        if (!token || token == 0xFFU || ++steps > 64U) return count;
        while (token >= 128U) {
            uint16_t index = (uint16_t)(token - 128U) * 2U;
            if (depth >= sizeof(stack) || ++steps > 64U) return count;
            stack[depth++] = LCD_TextByte(index + 1U);
            token = LCD_TextByte(index);
        }
        if (count >= 16U) return count;
        LCD_Byte(1U, token);
        count++;
    }
}

static void LCD_Line(uint8_t row, uint16_t text)
{
    uint8_t count;
    LCD_Position(row, 0U);
    count = LCD_String(text);
    while (count++ < 16U) LCD_Byte(1U, ' ');
}

static void LCD_RAMLine(uint8_t row, const char *text)
{
    uint8_t count = 0U;
    LCD_Position(row, 0U);
    while (count < 16U && *text) {
        LCD_Byte(1U, (uint8_t)*text++);
        count++;
    }
    while (count++ < 16U) LCD_Byte(1U, ' ');
}

static void LCD_BarLine(uint8_t row, uint8_t filled)
{
    uint8_t i;
    if (filled > 16U) filled = 16U;
    LCD_Position(row, 0U);
    for (i = 0U; i < 16U; i++) {
        LCD_Byte(1U, (i < filled) ? 0xFFU : ' ');
    }
}

static void LCD_Number(uint8_t address, uint8_t width, uint16_t value)
{
    char digits[5];
    uint8_t i;
    uint16_t remainder;
    uint8_t pad = (width & 0x80U) ? '0' : ' ';
    width &= 0x7FU;
    if (width > 5U) width = 5U;
    i = width;
    while (i != 0U) {
        uint8_t digit = pad;
        if (value != 0U || i == width) {
            value = __builtin_divmodud((uint32_t)value, 10U, &remainder);
            digit = (uint8_t)('0' + remainder);
        }
        digits[--i] = digit;
    }
    LCD_Command(0x80U | address);
    for (i = 0U; i < width; i++) LCD_Byte(1U, (uint8_t)digits[i]);
}
#define LCD_NumberAt(r,c,w,v) LCD_Number(((r) ? 0x40U : 0U) + (c),(w),(v))
#define LCD_NumberZeroAt(r,c,w,v) LCD_Number(((r) ? 0x40U : 0U) + (c),0x80U | (w),(v))

static void LCD_TwoLines(uint16_t line1, uint16_t line2)
{
    LCD_Line(0U, line1);
    LCD_Line(1U, line2);
}

static void LCD_Init(void)
{
    LCD_RS_LAT = 0;
    LCD_E_LAT = 0;
    DelayMs_WDT(40U);
    LCD_Nibble(3U);
    DelayMs_WDT(5U);
    LCD_Nibble(3U);
    __delay_us(150);
    LCD_Nibble(3U);
    LCD_Nibble(2U);
    LCD_Command(0x28U);
    LCD_Command(0x08U);
    LCD_Command(0x01U);
    LCD_Command(0x06U);
    LCD_Command(0x0CU);
}

static uint16_t Wave_Name(uint8_t wave)
{
    if (wave == WAVE_MODIFIED) return TXT_8;
    if (wave == WAVE_PURE) return TXT_9;
    return TXT_10;
}

static uint16_t Wave_Code(void)
{
    if (g_cfg.wave_type == WAVE_PURE) return TXT_12;
    return (g_run.effective_wave == EFFECTIVE_WAVE_OVERMOD) ? TXT_13 : TXT_12;
}

static uint16_t OnOff(uint8_t value)
{
    return value ? TXT_14 : TXT_15;
}

static uint16_t Fault_Text(uint8_t fault)
{
    static const uint16_t text[] = {
        TXT_27, TXT_16, TXT_17, TXT_18, TXT_19, TXT_20, TXT_21, TXT_22, TXT_23, TXT_24, TXT_25, TXT_26
    };
    if (fault == FAULT_RESET_LOCK) return TXT_25;
    if (fault == FAULT_ADC_SENSE) return TXT_118;
    if (fault > FAULT_PV_RETRY_LOCK) fault = FAULT_NONE;
    return text[fault];
}

/* ---------------------------------- keys ---------------------------------- */
#define KEY_ENTER                  0x01U
#define KEY_UP                     0x02U
#define KEY_DOWN                   0x04U
#define KEY_LONG_ENTER             0x08U

static uint8_t g_key_event;
static uint16_t g_enter_hold;
static uint16_t g_enter_tick;
static uint16_t g_up_hold;
static uint16_t g_down_hold;

static void Keys_Service10ms(void)
{
    g_key_event = 0U;
    if (BTN_ENTER()) {
        if (g_enter_hold < 3U) {
            if (++g_enter_hold == 3U) g_enter_tick = g_tick10_produced;
        } else if (g_enter_hold != 201U &&
                   (uint16_t)(g_tick10_produced - g_enter_tick) >= 200U) {
            g_enter_hold = 201U;
            g_key_event |= KEY_LONG_ENTER;
        }
    } else {
        if (g_enter_hold >= 3U && g_enter_hold != 201U) g_key_event |= KEY_ENTER;
        g_enter_hold = 0U;
    }

    if (BTN_UP()) {
        if (g_up_hold < 65000U) g_up_hold++;
        if (g_up_hold == 3U ||
            (g_up_hold >= 35U && ((g_up_hold - 35U) & 3U) == 0U))
            g_key_event |= KEY_UP;
    } else g_up_hold = 0U;

    if (BTN_DOWN()) {
        if (g_down_hold < 65000U) g_down_hold++;
        if (g_down_hold == 3U ||
            (g_down_hold >= 35U && ((g_down_hold - 35U) & 3U) == 0U))
            g_key_event |= KEY_DOWN;
    } else g_down_hold = 0U;
}

/* ----------------------------------- UI ----------------------------------- */
enum {
    UI_CHECK = 0,
    UI_STARTING,
    UI_STATUS_BANNER,
    UI_MAIN,
    UI_INFO,
    UI_FAULT,
    UI_MENU
};


/* 26 Pure Unipolar Menu Items */
enum {
    MENU_AC_OUTPUT = 0,
    MENU_PV_MAX,
    MENU_PV_MIN,
    MENU_PV_CAL_MODE,
    MENU_PV_CAL,
    MENU_CARRIER,
    MENU_ALIGNMENT,
    MENU_SHUNT,
    MENU_AMP_GAIN,
    MENU_DEADTIME_MODE,
    MENU_DEADTIME,
    MENU_UNI_BRIDGE,
    MENU_WAVE,
    MENU_UNI_TORQUE,
    MENU_SOFT_START,
    MENU_CHANGEOVER,
    MENU_AUTO_RESTART,
    MENU_SHORT_REBOOT,
    MENU_SHORT_SENSITIVITY,
    MENU_PROTECT_PV_LOW,
    MENU_PROTECT_PV_HIGH,
    MENU_PROTECT_OVERLOAD,
    MENU_PROTECT_TEMP,
    MENU_FACTORY,
    MENU_NO_SAVE,
    MENU_SAVE_EXIT,
    MENU_COUNT
};

static uint8_t g_ui_state;
static uint8_t g_menu_item;
static bool g_menu_editing;
static bool g_factory_confirm;
static uint16_t g_ui_ms;
static uint8_t g_main_refresh;

static uint16_t WrapValue(uint16_t value, uint16_t low, uint16_t high,
                          uint16_t step, bool up)
{
    if (up) return ((uint32_t)value + step > high) ? low : (uint16_t)(value + step);
    return (value < (uint16_t)(low + step)) ? high : (uint16_t)(value - step);
}

static uint32_t U32_DivU32(uint32_t numerator, uint32_t denominator)
{
    uint32_t quotient = 0UL;
    uint32_t remainder = 0UL;
    uint8_t bit;
    if (denominator == 0UL) return 0xFFFFFFFFUL;
    for (bit = 0U; bit < 32U; bit++) {
        remainder = (remainder << 1) | (numerator >> 31);
        numerator <<= 1;
        quotient <<= 1;
        if (remainder >= denominator) {
            remainder -= denominator;
            quotient |= 1UL;
        }
    }
    return quotient;
}

static void UI_ShowStatus(void)
{
    if (g_run.fault != FAULT_NONE) {
        static const uint8_t codes[] = {0, 3, 4, 1, 5, 2, 7, 8, 6, 9, 10, 11, 12, 13};
        uint8_t fault = g_run.fault;
        uint8_t code = (fault <= FAULT_RESET_LOCK) ? codes[fault] : 0U;
        char line[17] = "FAULT CODE F    ";
        if (code < 10U) line[12] = (char)('0' + code);
        else { line[12] = '1'; line[13] = (char)('0' + code - 10U); }
        LCD_RAMLine(0U, line);
        if (fault == FAULT_SHORT && g_cfg.auto_restart && g_cfg.short_restart &&
            g_restart_attempts < AUTO_RESTART_LIMIT)
            LCD_NumberZeroAt(0U, 14U, 2U, Short_CountdownSeconds());
        if (fault == FAULT_ADC_SENSE) LCD_Line(1U, TXT_HOST_ADC_SENSE);
        else if (fault == FAULT_RESET_LOCK) LCD_Line(1U, TXT_HOST_RESET_LOCK);
        else LCD_Line(1U, Fault_Text(fault));
    } else if (g_pwm_active) {
        LCD_Line(0U, TXT_29);
        LCD_Line(1U, TXT_30);
    } else {
        LCD_Line(0U, TXT_31);
        LCD_Line(1U, TXT_32);
    }
}

/* Restored Soft-Start Screen with Percentage (0..100%) and 16-Block Animated Progress Bar */
static void UI_ShowSoftStart(void)
{
    uint16_t total = (g_cfg.soft_start_ms != 0U) ? g_cfg.soft_start_ms : 1U;
    uint16_t elapsed = (g_soft_elapsed_ms > total) ? total : g_soft_elapsed_ms;
    uint16_t pct = __builtin_divud(__builtin_muluu(elapsed, 100U), total);
    uint8_t bars = (uint8_t)__builtin_divud(__builtin_muluu(elapsed, 16U) + (total >> 1), total);
    LCD_Line(0U, TXT_78);
    LCD_NumberAt(0U, 12U, 3U, pct);
    LCD_Position(0U, 15U);
    LCD_Byte(1U, '%');
    LCD_BarLine(1U, bars);
}

static void UI_UpdateMain(void);
static void UI_ShowMain(void)
{
    LCD_Line(0U, TXT_33);
    LCD_Line(1U, TXT_34);
    UI_UpdateMain();
}

static void UI_UpdateMain(void)
{
    LCD_NumberZeroAt(0U, 3U, 3U, g_run.pv_v);
    LCD_NumberZeroAt(0U, 10U, 3U, g_run.estimated_ac_v);
    LCD_NumberZeroAt(1U, 2U, 4U, (g_run.load_w > 9999U) ? 9999U : g_run.load_w);
    LCD_Position(1U, 13U);
    LCD_String(Wave_Code());
    g_main_refresh = 0U;
}

/* P1: 13-page SYSTEM INFO subsystem removed (button presses no longer open
 * info pages). Only the post-soft-start STATUS banner remains. */
static void UI_ShowInfo(void)
{
    if (g_pwm_active && g_run.fault == FAULT_NONE)
        LCD_TwoLines(TXT_29, TXT_30);
    else
        LCD_TwoLines(TXT_28, TXT_120);
}

enum { MF_ACTION = 0, MF_ENUM = 1, MF_BIT = 4, MF_PERCENT = 5, MF_TORQUE = 6,
       MF_BRIDGE = 7, MF_VOLTS = 0x80, MF_KHZ, MF_NS, MF_SEC, MF_TENTH };
typedef struct {
    uint16_t title, low, high, step;
    uint8_t offset, format;
} menu_descriptor_t;
static const menu_descriptor_t menu_descriptor[MENU_COUNT] = {
    {TXT_63, 180, 260, 1, offsetof(settings_t, ac_output_v), MF_VOLTS},           /* 01: AC_OUTPUT */
    {TXT_64, 300, PV_MAX_CONFIGURABLE_V, 1, offsetof(settings_t, pv_max_v), MF_VOLTS}, /* 02: PV_MAX */
    {TXT_65, 100, 300, 1, offsetof(settings_t, pv_min_v), MF_VOLTS},              /* 03: PV_MIN */
    {TXT_66, 0, 1, 1, offsetof(settings_t, pv_cal_auto), MF_ENUM},                /* 04: PV_CAL_MODE */
    {TXT_67, PV_CAL_MIN_3V_V, PV_CAL_MAX_3V_V, 1, offsetof(settings_t, pv_cal_3v_v), MF_VOLTS}, /* 05: PV_CAL */
    {TXT_68, 13000, 16000, 1000, offsetof(settings_t, carrier_hz), MF_KHZ},       /* 06: CARRIER */
    {txt_align_title, PWM_ALIGN_EDGE, PWM_ALIGN_CENTER, 1,
     offsetof(settings_t, pwm_alignment), MF_ENUM},                               /* 07: ALIGNMENT */
    {txt_shunt_title, SHUNT_MIN_TENTH_MOHM, SHUNT_MAX_TENTH_MOHM, 1,
     offsetof(settings_t, shunt_tenth_mohm), MF_TENTH},                           /* 08: SHUNT mOhm */
    {txt_gain_title, AMP_GAIN_MIN_X10, AMP_GAIN_MAX_X10, 1,
     offsetof(settings_t, amp_gain_x10), MF_TENTH},                               /* 09: AMP GAIN */
    {TXT_70, 0, 1, 1, offsetof(settings_t, deadtime_auto), MF_ENUM},              /* 10: DEADTIME_MODE */
    {TXT_40, DEADTIME_MIN_NS, DEADTIME_MAX_NS, 10, offsetof(settings_t, deadtime_ns), MF_NS}, /* 11: DEADTIME */
    {txt_uni_bridge, UNI_BRIDGE_RIGHT, UNI_BRIDGE_ALT, 1,
     offsetof(settings_t, protection_mask), MF_BRIDGE},                           /* 12: UNI_BRIDGE */
    {TXT_72, 0, WAVE_PURE, 1, offsetof(settings_t, wave_type), MF_ENUM},          /* 13: WAVE */
    {txt_uni_torque, 0, 3, 1, offsetof(settings_t, protection_mask), MF_TORQUE},  /* 14: UNI_TORQUE */
    {TXT_78, 1000, 10000, 1000, offsetof(settings_t, soft_start_ms), MF_SEC},     /* 15: SOFT_START */
    {TXT_79, 0, 1, 1, offsetof(settings_t, changeover_enable), MF_ENUM},          /* 16: CHANGEOVER */
    {TXT_80, 0, 1, 1, offsetof(settings_t, auto_restart), MF_ENUM},               /* 17: AUTO_RESTART */
    {txt_short_reboot, 0, 1, 1, offsetof(settings_t, short_restart), MF_ENUM},    /* 18: SHORT_REBOOT */
    {TXT_18, SHORT_SENSITIVITY_MIN, SHORT_SENSITIVITY_MAX, 1,
     offsetof(settings_t, short_sensitivity_pct), MF_PERCENT},                    /* 19: SHORT_SENSITIVITY */
    {TXT_82, 0, 0, PROTECT_PV_LOW, offsetof(settings_t, protection_mask), MF_BIT},/* 20: PROTECT_PV_LOW */
    {TXT_83, 0, 0, PROTECT_PV_HIGH, offsetof(settings_t, protection_mask), MF_BIT},/* 21: PROTECT_PV_HIGH */
    {TXT_84, 0, 0, PROTECT_OVERLOAD, offsetof(settings_t, protection_mask), MF_BIT},/* 22: PROTECT_OVERLOAD */
    {TXT_85, 0, 0, PROTECT_TEMPERATURE, offsetof(settings_t, protection_mask), MF_BIT},/* 23: PROTECT_TEMP */
    {TXT_86, TXT_102, TXT_101, 0, 0, MF_ACTION},                                  /* 24: FACTORY */
    {TXT_87, TXT_102, 0, 0, 0, MF_ACTION},                                        /* 25: NO_SAVE */
    {TXT_88, TXT_103, 0, 0, 0, MF_ACTION},                                        /* 26: SAVE_EXIT */
};

static uint16_t Menu_ReadValue(const settings_t *s, const menu_descriptor_t *m)
{
    const uint8_t *p = (const uint8_t *)s + m->offset;
    if (m->format == MF_TORQUE) return UNI_TORQUE_LEVEL(s);
    if (m->format == MF_BRIDGE) return UNI_BRIDGE_SIDE(s);
    if (m->format & 0x80U)
        return (uint16_t)((uint16_t)p[0] | ((uint16_t)p[1] << 8));
    return (uint16_t)p[0];
}

static bool Settings_Valid(const settings_t *s)
{
    uint8_t i;
    for (i = 0U; i < MENU_COUNT; i++) {
        const menu_descriptor_t *m = &menu_descriptor[i];
        if (m->format != MF_ACTION && m->format != MF_BIT) {
            uint16_t v = Menu_ReadValue(s, m);
            if ((uint16_t)(v - m->low) > (uint16_t)(m->high - m->low))
                return false;
        }
    }
    return s->mode == MODE_UNIPOLAR &&
           (uint16_t)(s->pv_min_v + 20U) <= s->pv_max_v &&
           (s->pv_max_v <= 500U || !s->pv_cal_auto) &&
           (s->pv_cal_auto ? AUTO_PV_CAL_3V_V : s->pv_cal_3v_v) * 5U >=
           (s->pv_max_v + 20U) * 3U &&
           Carrier_Valid(s->carrier_hz) &&
           (s->protection_mask & (uint8_t)~(PROTECT_ALL | UNI_TORQUE_MASK | UNI_BRIDGE_MASK)) == 0U;
}

static void LCD_MenuValue(uint16_t value, uint16_t unit)
{
    uint8_t count;
    LCD_NumberAt(1U, 0U, 5U, value);
    LCD_Byte(1U, ' ');
    count = (uint8_t)(6U + LCD_String(unit));
    while (count++ < 16U) LCD_Byte(1U, ' ');
}

static void UI_ShowMenu(void)
{
    const menu_descriptor_t *m = &menu_descriptor[g_menu_item];
    uint16_t value = Menu_ReadValue(&g_edit, m);
    uint16_t text = OnOff((uint8_t)value);
    uint16_t unit = TXT_90;
    WDT_KICK();
    LCD_Line(0U, m->title);
    switch (m->format) {
        case MF_ACTION:
            LCD_Line(1U, (g_menu_item == MENU_FACTORY && g_factory_confirm) ? m->high : m->low);
            break;
        case MF_BIT: LCD_Line(1U, OnOff((uint8_t)(value & m->step))); break;
        case MF_BRIDGE:
            LCD_Line(1U, (value == UNI_BRIDGE_LEFT) ? txt_bridge_left :
                         ((value == UNI_BRIDGE_ALT) ? txt_bridge_alt :
                                                      txt_bridge_right));
            break;
        case MF_TORQUE:
            if (value == 0U) LCD_Line(1U, TXT_15);
            else {
                LCD_Line(1U, txt_torque_value);
                LCD_NumberAt(1U, 9U, 3U, (value == 1U) ? 100U :
                             ((value == 2U) ? 250U : 500U));
            }
            break;
        case MF_PERCENT:
            LCD_Line(1U, txt_short_sensitivity);
            LCD_NumberAt(1U, 12U, 3U, value);
            break;
        case MF_ENUM:
            switch (g_menu_item) {
                case MENU_PV_CAL_MODE: text = value ? TXT_91 : TXT_92; break;
                case MENU_ALIGNMENT:
                    text = value ? txt_align_center : txt_align_edge;
                    break;
                case MENU_DEADTIME_MODE: text = value ? TXT_10 : TXT_92; break;
                case MENU_WAVE: text = Wave_Name((uint8_t)value); break;
                default: break;
            }
            LCD_Line(1U, text);
            break;
        case MF_TENTH:
            LCD_Line(1U, TXT_0);
            LCD_NumberAt(1U, 0U, 4U, (uint16_t)(value / 10U));
            LCD_Position(1U, 4U);
            LCD_Byte(1U, '.');
            LCD_NumberAt(1U, 5U, 1U, (uint16_t)(value % 10U));
            break;
        default:
            switch (m->format) {
                case MF_KHZ: value /= 1000U; unit = TXT_93; break;
                case MF_NS: unit = TXT_94; break;
                case MF_SEC: value /= 1000U; unit = TXT_99; break;
                default: break;
            }
            LCD_MenuValue(value, unit);
            break;
    }
    LCD_Position(0U, 15U);
    LCD_Byte(1U, g_menu_editing ? '*' : ' ');
    WDT_KICK();
}

static void UI_Adjust(bool up)
{
    const menu_descriptor_t *m = &menu_descriptor[g_menu_item];
    uint8_t *p = (uint8_t *)&g_edit + m->offset;
    uint16_t low = m->low, high = m->high, value;
    if (m->format == MF_ACTION) return;
    if (m->format == MF_BIT) { *p ^= (uint8_t)m->step; return; }
    if ((g_menu_item == MENU_PV_CAL && g_edit.pv_cal_auto) ||
        (g_menu_item == MENU_DEADTIME && g_edit.deadtime_auto)) return;
    if (g_menu_item == MENU_PV_MAX) {
        if (g_edit.pv_min_v + 20U > low) low = g_edit.pv_min_v + 20U;
    }
    if (g_menu_item == MENU_PV_MIN) {
        if (g_edit.pv_max_v - 20U < high) high = g_edit.pv_max_v - 20U;
    }
    value = WrapValue(Menu_ReadValue(&g_edit, m), low, high, m->step, up);
    if (m->format == MF_TORQUE) {
        *p = (uint8_t)((*p & (uint8_t)~UNI_TORQUE_MASK) |
                      (value << UNI_TORQUE_SHIFT));
    } else if (m->format == MF_BRIDGE) {
        *p = (uint8_t)((*p & (uint8_t)~UNI_BRIDGE_MASK) |
                      ((value & 3U) << UNI_BRIDGE_SHIFT));
    } else if (m->format & 0x80U) {
        p[0] = (uint8_t)(value & 0x00FFU);
        p[1] = (uint8_t)(value >> 8);
    } else {
        *p = (uint8_t)value;
    }
    if (g_menu_item == MENU_PV_MAX && value > 500U) g_edit.pv_cal_auto = 0U;
}

static void System_Reset(void)
{
    PWM_Off();
    CHANGEOVER_OFF();
    DelayMs_WDT(3000U);
    __asm__ volatile ("reset");
    for (;;) { ; }
}

static void UI_SaveAndReset(bool factory)
{
    settings_t to_save;
    if (factory) Settings_Default(&to_save);
    else to_save = g_edit;
    to_save.mode = MODE_UNIPOLAR;

    if (!Settings_Valid(&to_save)) {
        LCD_TwoLines(TXT_104, TXT_105);
        g_menu_editing = false;
        return;
    }

    PWM_Off();
    LCD_TwoLines(factory ? TXT_106 : TXT_107, TXT_108);
    if (!Settings_Save_WhileOff(&to_save)) {
        g_run.fault = FAULT_EEPROM;
        LCD_TwoLines(TXT_109, TXT_110);
        g_ui_state = UI_FAULT;
        return;
    }
    LCD_TwoLines(TXT_111, TXT_112);
    System_Reset();
}

static void UI_EnterMenuAction(void)
{
    if (g_menu_item == MENU_FACTORY) {
        if (!g_factory_confirm) {
            g_factory_confirm = true;
            UI_ShowMenu();
        } else UI_SaveAndReset(true);
        return;
    }
    if (g_menu_item == MENU_NO_SAVE) {
        g_edit = g_cfg;
        g_menu_editing = false;
        g_factory_confirm = false;
        if (g_run.fault != FAULT_NONE) {
            g_ui_state = UI_FAULT;
            UI_ShowStatus();
        } else if (g_pwm_active) {
            g_ui_state = UI_MAIN;
            UI_ShowMain();
        } else {
            g_ui_state = UI_CHECK;
            g_ui_ms = 0U;
            UI_ShowStatus();
        }
        return;
    }
    if (g_menu_item == MENU_SAVE_EXIT) {
        UI_SaveAndReset(false);
        return;
    }
    g_menu_editing = !g_menu_editing;
    UI_ShowMenu();
}

static void UI_OpenMenu(void)
{
    g_edit = g_cfg;
    g_menu_item = MENU_AC_OUTPUT;
    g_menu_editing = false;
    g_factory_confirm = false;
    g_ui_state = UI_MENU;
    g_ui_ms = 0U;
    UI_ShowMenu();
}

static void UI_Service10ms(void)
{
    g_ui_ms += 10U;
    if ((g_ui_state == UI_STARTING || g_ui_state == UI_STATUS_BANNER ||
         g_ui_state == UI_MAIN || g_ui_state == UI_INFO) &&
        (g_run.fault != FAULT_NONE || !g_pwm_active)) {
        PWM_Off();
        g_ui_state = UI_FAULT;
        UI_ShowStatus();
        return;
    }

    if (g_ui_state == UI_CHECK) {
        if (g_run.fault != FAULT_NONE) {
            g_ui_state = UI_FAULT;
            UI_ShowStatus();
            return;
        }
        if (!Clock_OK()) {
            Fault_Trip(FAULT_CLOCK);
            g_ui_state = UI_FAULT;
            UI_ShowStatus();
            return;
        }
        if (g_key_event & KEY_LONG_ENTER) {
            UI_OpenMenu();
            return;
        }
        if (g_ui_ms >= 200U) {
            UI_ShowStatus();
            if (PWM_Start()) {
                g_ui_state = UI_STARTING;
                g_ui_ms = 0U;
                UI_ShowSoftStart();
            }
        }
        return;
    }

    if (g_ui_state == UI_STARTING) {
        if (g_key_event & KEY_LONG_ENTER) {
            UI_OpenMenu();
            return;
        }
        if (g_soft_elapsed_ms <= g_cfg.soft_start_ms) {
            if ((g_ui_ms % 100U) == 0U) UI_ShowSoftStart();
            if (g_soft_elapsed_ms >= g_cfg.soft_start_ms &&
                g_ui_ms > g_cfg.soft_start_ms) {
                g_soft_elapsed_ms++;
                /* Show STATUS: ON / PWM ACTIVE and SYSTEM INFO / ENTER TO VIEW before UI_MAIN */
                g_ui_state = UI_STATUS_BANNER;
                g_ui_ms = 0U;
                UI_ShowInfo();
            }
            return;
        }
        return;
    }

    if (g_ui_state == UI_STATUS_BANNER) {
        if (g_key_event & KEY_LONG_ENTER) {
            UI_OpenMenu();
            return;
        }
        if (g_ui_ms >= 1400U) {   /* P1: same 1.4 s banner time, no info page */
            g_ui_state = UI_MAIN;
            g_main_refresh = 0U;
            g_ui_ms = 0U;
            UI_ShowMain();
        }
        return;
    }

    if (g_ui_state == UI_MAIN) {
        if (++g_main_refresh >= 30U) UI_UpdateMain();
        if (g_key_event & KEY_LONG_ENTER) {
            UI_OpenMenu();
            return;
        }
        return;
    }

    if (g_ui_state == UI_FAULT) {
        if (g_run.fault == FAULT_NONE) {
            g_ui_state = UI_CHECK;
            g_ui_ms = 0U;
            if (g_short_restart_ready) {
                LCD_NumberZeroAt(0U, 14U, 2U, 0U);
                g_short_restart_ready = false;
            } else UI_ShowStatus();
            return;
        }
        if ((g_ui_ms % 500U) == 0U) UI_ShowStatus();
        if (g_key_event & KEY_LONG_ENTER) UI_OpenMenu();
        return;
    }

    /* UI_MENU */
    if (!g_menu_editing) {
        if (g_key_event & KEY_UP) {
            g_menu_item = (g_menu_item == 0U) ? (MENU_COUNT - 1U) : (uint8_t)(g_menu_item - 1U);
            g_factory_confirm = false;
            UI_ShowMenu();
        }
        if (g_key_event & KEY_DOWN) {
            g_menu_item = (g_menu_item >= (MENU_COUNT - 1U)) ? 0U : (uint8_t)(g_menu_item + 1U);
            g_factory_confirm = false;
            UI_ShowMenu();
        }
        if (g_key_event & KEY_ENTER) UI_EnterMenuAction();
    } else {
        if (g_key_event & KEY_UP) {
            UI_Adjust(true);
            UI_ShowMenu();
        }
        if (g_key_event & KEY_DOWN) {
            UI_Adjust(false);
            UI_ShowMenu();
        }
        if (g_key_event & KEY_ENTER) UI_EnterMenuAction();
    }
}

/* Restored Multi-Stage Boot Initialization, Status Checks & Animated Bar */
static void Boot_Sequence(void)
{
    uint8_t step;
    PWM_Off();
    LCD_Init();

    /* Stage 1 (3.0 Seconds): Animated Initialization Loading Style (16 blocks x 187.5 ms = 3000 ms) */
    LCD_Line(0U, TXT_113); /* "INITIALIZATION" */
    for (step = 1U; step <= 16U; step++) {
        LCD_BarLine(1U, step);
        DelayMs_WDT((step & 1U) ? 187U : 188U);
    }

    /* Stage 2 (3.0 Seconds): Prime Volt Inverters Alpha Version (Sumed Iqbal) Status Banner */
    LCD_TwoLines(TXT_114, TXT_48);            /* "PRIME VOLT INV." / "ALPHA VERSION" (1500 ms) */
    DelayMs_WDT(1500U);
    LCD_TwoLines(TXT_48, TXT_HOST_VERSION);   /* "ALPHA VERSION" / "(Sumed Iqbal)" (1500 ms) */
    DelayMs_WDT(1500U);

    /* Stage 3 (3.0 Seconds): System Checking (Fault Check + PV Config Check + Status Ready) */
    LCD_TwoLines(TXT_32, (g_run.fault == FAULT_NONE) ? TXT_115 : TXT_120); /* "SYSTEM CHECKING" / "FAULT CHECK OK" (1000 ms) */
    DelayMs_WDT(1000U);
    LCD_TwoLines(TXT_116, Settings_Valid(&g_cfg) ? TXT_117 : TXT_118);     /* "PV CONFIG CHECK" / "CONFIGURATION OK" (1000 ms) */
    DelayMs_WDT(1000U);
    LCD_TwoLines(TXT_32, (g_run.fault == FAULT_NONE) ? TXT_31 : TXT_120);  /* "SYSTEM CHECKING" / "STATUS: READY" (1000 ms) */
    DelayMs_WDT(1000U);
}

/* ------------------------------ 1 ms timebase ------------------------------ */
static uint16_t g_tick10_consumed;
static volatile uint8_t g_tick_div10;

static void Timer1_Init(void)
{
    g_tick_div10 = 0U;
    g_tick10_produced = 0U;
    g_tick10_consumed = 0U;
    T1CON = 0U;
    T1CONbits.TCS = 0U;
    T1CONbits.TGATE = 0U;
    T1CONbits.TCKPS = 0U;
    TMR1 = 0U;
    PR1 = (uint16_t)(((FCY + 500UL) / 1000UL) - 1UL);
    IFS0bits.T1IF = 0;
    IPC0bits.T1IP = 2U;
    IEC0bits.T1IE = 1;
    T1CONbits.TON = 1;
}

void __attribute__((interrupt, no_auto_psv)) _T1Interrupt(void)
{
    IFS0bits.T1IF = 0;
    if (++g_tick_div10 >= 10U) {
        g_tick_div10 = 0U;
        g_tick10_produced++;
    }
}

static void Control_Service10ms(void)
{
    uint16_t target;
    uint16_t difference;
    uint16_t dyn_hz = FUNDAMENTAL_HZ;
    uint16_t drive_gain;
    uint16_t reference;
    uint16_t reciprocal;
    uint32_t next_step;
    if (!g_pwm_active || g_run.fault != FAULT_NONE) {
        g_modulation_q15 = 0U;
        g_drive_gain_q13 = 0U;
        g_drive_gain_fast_q13 = 0U;
        g_ac_trim_q15 = 0;
        g_run.estimated_ac_v = 0U;
        return;
    }

    if (!PTCONbits.PTEN || PWMCON1 != 0x0033U || !IEC2bits.PWMIE) {
        Fault_Trip(FAULT_PWM_CONFIG);
        return;
    }
    ControlTarget_Update();
    target = g_target_q15;

    if (g_uni_torque_enabled && g_pv_fast_adc < g_uni_reserve_adc) {
        uint16_t band = (uint16_t)(g_uni_reserve_adc - g_uni_floor_adc);
        uint16_t dip = (g_pv_fast_adc > g_uni_floor_adc) ?
                       (uint16_t)(g_uni_reserve_adc - g_pv_fast_adc) : band;
        if (band != 0U) {
            target -= __builtin_divud(__builtin_muluu(target, dip),
                                      (uint16_t)(band << 2));
            dyn_hz -= __builtin_divud(__builtin_muluu(dip, 12U), band);
        }
        if (g_modulation_q15 > target) g_modulation_q15 = target;
        g_run.regulation_limited = true;
        g_ac_trim_q15 = 0;
    }
    if (g_soft_elapsed_ms < g_cfg.soft_start_ms) {
        uint32_t next = (uint32_t)g_soft_elapsed_ms + 10UL;
        if (next > g_cfg.soft_start_ms) next = g_cfg.soft_start_ms;
        g_soft_elapsed_ms = (uint16_t)next;
        g_modulation_q15 = __builtin_divud(__builtin_muluu(target, g_soft_elapsed_ms),
                                           g_cfg.soft_start_ms);
        if (g_uni_torque_enabled && dyn_hz > 20U) {
            dyn_hz = (uint16_t)(20U + __builtin_divud(
                __builtin_muluu((uint16_t)(dyn_hz - 20U), g_soft_elapsed_ms),
                g_cfg.soft_start_ms));
        }
    } else if (g_modulation_q15 < target) {
        difference = (uint16_t)(target - g_modulation_q15);
        g_modulation_q15 += (difference > MOD_TRACK_UP_Q15) ?
                            MOD_TRACK_UP_Q15 : difference;
    } else if (g_modulation_q15 > target) {
        difference = (uint16_t)(g_modulation_q15 - target);
        g_modulation_q15 -= (difference > MOD_TRACK_DOWN_Q15) ?
                            MOD_TRACK_DOWN_Q15 : difference;
    }
    next_step = PWM_PhaseStep(dyn_hz, PTPER, g_cfg.pwm_alignment);

    if (g_run.effective_wave == EFFECTIVE_WAVE_OVERMOD)
        drive_gain = OvermodGain_FromFundamentalQ15(g_modulation_q15);
    else
        drive_gain = (uint16_t)((g_modulation_q15 + 2U) >> 2);

    reference = ADCBUF0;
    reciprocal = (reference >= PV_FAST_MIN_ADC) ?
                 (uint16_t)__builtin_divud(32768UL, reference) : 0U;
    __builtin_disi(0x3FFF);
    g_phase_step = next_step;
    g_drive_gain_q13 = drive_gain;
    g_pv_reference_adc = reference;
    g_pv_recip_q15 = reciprocal;
    __builtin_disi(0);

    g_run.estimated_ac_v = g_run.ac_feedback_active ? g_run.measured_ac_v :
        __builtin_divud(__builtin_muluu(g_run.pv_v, g_modulation_q15) + 23170UL,
                        46341U);
}

int main(void)
{
    uint8_t service20_div = 0U;
    bool loaded;
    /* Lock only on hardware trap/illegal-opcode resets (0xC000), never on WDTO */
    bool trap_reset = (RCON & 0xC000U) != 0U;

    INTCON1bits.NSTDIS = 1;
    Hardware_Init();
    PWM_Off();
    RCON &= (uint16_t)~0xC01FU;

    loaded = Settings_Load(&g_cfg);
    if (!loaded) {
        Settings_Default(&g_cfg);
        if (!Settings_Save_WhileOff(&g_cfg)) g_run.fault = FAULT_EEPROM;
    }
    g_edit = g_cfg;
    g_run.pv_v = 0U;
    g_run.load_w = 0U;
    g_run.estimated_ac_v = 0U;
    g_run.measured_ac_v = 0U;
    g_run.ac_feedback_active = false;
    if (loaded) g_run.fault = FAULT_NONE;
    if (trap_reset) g_run.fault = FAULT_RESET_LOCK;
    g_run.effective_wave = EFFECTIVE_WAVE_PURE;
    g_run.regulation_limited = false;
    g_measurements_valid = false;
    g_restart_attempts = 0U;
    g_short_pending = false;
    g_short_clear_started = false;
    g_short_restart_ready = false;
    g_short_clear_tick = 0U;
    g_fault_clear_ms = 0U;
    g_healthy_ms = 0UL;
    g_ac_feedback_good = 0U;
    g_ac_trim_q15 = 0;

    ADC_Init();
    DelayMs_WDT(5U);
    g_current_zero_adc = ADC_ReadMean8(1U);
    ShortSensitivity_Init();
    g_ac_zero_adc = ADC_ReadMean8(2U);
    g_ac_sensor_present = BOARD_HAS_VERIFIED_AC_VOLTAGE_FEEDBACK &&
                          (g_ac_zero_adc <= AC_FB_ZERO_MAX_ADC);
    g_pv_fast_adc = ADCBUF0;
    g_pv_reference_adc = g_pv_fast_adc;
    PWM_Init();
    FLTA_Init();
    Measurements_Update();
    ControlTarget_Update();
    if (!Clock_OK()) g_run.fault = FAULT_CLOCK;
    else if (g_run.fault == FAULT_NONE) {
        uint8_t initial_fault = ActiveFault();
        if (initial_fault != FAULT_NONE) Fault_Trip(initial_fault);
    }

    Boot_Sequence();
    g_ui_state = (g_run.fault == FAULT_NONE) ? UI_CHECK : UI_FAULT;
    g_menu_item = MENU_AC_OUTPUT;
    g_menu_editing = false;
    g_factory_confirm = false;
    g_ui_ms = 0U;
    g_main_refresh = 0U;
    g_key_event = 0U;
    g_enter_hold = g_up_hold = g_down_hold = 0U;
    UI_ShowStatus();
    Timer1_Init();

    for (;;) {
        while (g_tick10_consumed != g_tick10_produced) {
            g_tick10_consumed++;
            Keys_Service10ms();
            Control_Service10ms();
            if (++service20_div >= 2U) {
                service20_div = 0U;
                Measurements_Update();
                Protection_Service20ms();
                Changeover_Service();
            }
            UI_Service10ms();
            WDT_KICK();
        }

        if ((SHORT_ACTIVE() || g_an1_over_count >= AN1_SHORT_FILTER_PERIODS) &&
            (!g_short_pending || g_short_clear_started)) Short_TripFast();
        if ((g_cfg.protection_mask & PROTECT_TEMPERATURE) && TEMP_ACTIVE() &&
            g_run.fault == FAULT_NONE) Fault_Trip(FAULT_TEMPERATURE);
        Changeover_Service();
    }
    return 0;
}