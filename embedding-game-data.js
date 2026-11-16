// Reviewed 2026-11-15 against Bolukbasi et al. (2016), arXiv:1607.06520.
// Rounds 1 and 10 are examples in the Introduction (PDF pp. 1 and 3).
// Rounds 2–8 reproduce generated analogy pairs in Figure 2 (PDF p. 2).
// Round 9 is an example in the Introduction (PDF p. 3).
// Answer choices and difficulty order are authored for Fluent, not paper results.
// Figure 2's stereotype grouping reflects the paper's crowd-worker ratings.
export const PAPER_ANALOGIES = [
  {left:'man',given:'king',right:'woman',output:'queen',choices:['princess','queen','doctor'],kind:'gendered',page:1,sourcePart:'Introduction',note:'A familiar gendered title relationship opens the game.'},
  {left:'she',given:'sister',right:'he',output:'brother',choices:['father','brother','king'],kind:'gendered',page:2,sourcePart:'Figure 2',note:'The paper lists this as a gender-specific relationship.'},
  {left:'she',given:'mother',right:'he',output:'father',choices:['uncle','sister','father'],kind:'gendered',page:2,sourcePart:'Figure 2',note:'This pair follows the gendered meanings of family words.'},
  {left:'she',given:'waitress',right:'he',output:'waiter',choices:['waiter','nurse','teacher'],kind:'gendered',page:2,sourcePart:'Figure 2',note:'These are gendered forms of the same job title.'},
  {left:'she',given:'hairdresser',right:'he',output:'barber',choices:['stylist','hairdresser','barber','surgeon'],kind:'stereotype',page:2,sourcePart:'Figure 2',note:'The researchers grouped this generated pair with gender stereotypes. Neither occupation belongs to one gender.'},
  {left:'she',given:'softball',right:'he',output:'baseball',choices:['baseball','soccer','football','tennis'],kind:'stereotype',page:2,sourcePart:'Figure 2',note:'The paper grouped this sports pairing with stereotypes, not a rule about who can play either sport.'},
  {left:'she',given:'sewing',right:'he',output:'carpentry',choices:['sewing','carpentry','cooking','gardening'],kind:'stereotype',page:2,sourcePart:'Figure 2',note:'This generated pair was rated as stereotyped in the study. Activities are not determined by gender.'},
  {left:'she',given:'interior designer',right:'he',output:'architect',choices:['artist','architect','designer','engineer','planner'],kind:'stereotype',page:2,sourcePart:'Figure 2',note:'The researchers list this occupational pair among the stereotype examples.'},
  {left:'father',given:'doctor',right:'mother',output:'nurse',choices:['surgeon','doctor','nurse','teacher','dentist'],kind:'stereotype',page:3,sourcePart:'Introduction',note:'The paper cites this as an offensive occupational association. A parent of any gender can be a doctor or nurse.'},
  {left:'man',given:'computer programmer',right:'woman',output:'homemaker',choices:['computer programmer','homemaker','doctor','engineer','scientist'],kind:'stereotype',page:3,sourcePart:'Introduction',note:'The paper highlights this output as a harmful stereotype in its historical word embedding.'}
];
